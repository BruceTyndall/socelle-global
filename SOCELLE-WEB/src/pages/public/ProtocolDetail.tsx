import { useParams, Link, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ArrowRight,
  ChevronRight,
  GraduationCap,
  Clock,
  Users,
  ShoppingCart,
  AlertTriangle,
  Tag,
  Beaker,
  ExternalLink,
  Sparkles,
  Heart,
  Activity,
  Ribbon,
} from 'lucide-react';
import MainNav from '../../components/MainNav';
import BlockReveal from '../../components/motion/BlockReveal';
import SiteFooter from '../../components/sections/SiteFooter';
import { useToast } from '../../components/Toast';
import { getProtocolBySlug, getProtocols } from '../../lib/protocols/mockProtocols';
import { CATEGORY_LABELS, SKILL_LABELS } from '../../lib/protocols/useProtocols';
import type { ProtocolCategory, SkillLevel } from '../../lib/protocols/types';

// ── Category / skill styling (mineral palette) ──────────────────────

const CATEGORY_ACCENT: Record<ProtocolCategory, string> = {
  facial:   'text-signal-warn',
  body:     'text-accent',
  wellness: 'text-signal-up',
  clinical: 'text-accent',
  oncology: 'text-signal-down',
};

const CATEGORY_BG: Record<ProtocolCategory, string> = {
  facial:   'bg-signal-warn/10',
  body:     'bg-accent/10',
  wellness: 'bg-signal-up/10',
  clinical: 'bg-accent/10',
  oncology: 'bg-signal-down/10',
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

export default function ProtocolDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { addToast } = useToast();

  const protocol = slug ? getProtocolBySlug(slug) : undefined;

  if (!protocol) {
    return <Navigate to="/protocols" replace />;
  }

  const catAccent = CATEGORY_ACCENT[protocol.category];
  const catBg = CATEGORY_BG[protocol.category];
  const skillBadge = SKILL_BADGE[protocol.skillLevel];
  const CatIcon = CATEGORY_ICONS[protocol.category];

  // Related protocols: same category, excluding current
  const related = getProtocols()
    .filter((p) => p.category === protocol.category && p.id !== protocol.id)
    .slice(0, 3);

  // If not enough same-category, fill from other protocols
  const relatedFilled =
    related.length < 3
      ? [
          ...related,
          ...getProtocols()
            .filter((p) => p.id !== protocol.id && !related.find((r) => r.id === p.id))
            .slice(0, 3 - related.length),
        ]
      : related;

  const handleAddAllToCart = () => {
    addToast('Cart integration coming soon', 'info');
  };

  const handleDownloadCertificate = () => {
    addToast('Certificate generation coming soon', 'info');
  };

  // Collect all unique products
  const allProducts = protocol.steps.flatMap((s) => s.products);
  const uniqueProducts = allProducts.filter(
    (p, i) => allProducts.findIndex((pp) => pp.name === p.name && pp.brand === p.brand) === i
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: protocol.title,
    description: protocol.description,
    totalTime: `PT${protocol.durationMinutes}M`,
    step: protocol.steps.map((s) => ({
      '@type': 'HowToStep',
      position: s.stepNumber,
      name: s.title,
      text: s.description,
    })),
  };

  return (
    <div className="min-h-screen bg-mn-bg font-sans">
      <Helmet>
        <title>{protocol.title} | Socelle Protocols</title>
        <meta name="description" content={protocol.description.slice(0, 155)} />
        <link rel="canonical" href={`https://socelle.com/protocols/${protocol.slug}`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <MainNav />

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="py-12 lg:py-16">
        <div className="section-container">
          {/* Breadcrumb */}
          <BlockReveal>
          <nav className="flex items-center gap-1.5 text-sm font-sans text-graphite/40 mb-8">
            <Link to="/protocols" className="hover:text-graphite transition-colors">
              Protocols
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-[rgba(30,37,43,0.62)]">{CATEGORY_LABELS[protocol.category]}</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-graphite truncate">{protocol.title}</span>
          </nav>
          </BlockReveal>

          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans font-semibold ${catBg} ${catAccent}`}>
                <CatIcon className="w-3 h-3" />
                {CATEGORY_LABELS[protocol.category]}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-sans font-semibold ${skillBadge}`}>
                {SKILL_LABELS[protocol.skillLevel]}
              </span>
            </div>

            <h1 className="font-sans font-semibold text-hero text-graphite leading-tight mb-6">
              {protocol.title}
            </h1>

            <p className="text-[rgba(30,37,43,0.62)] font-sans text-body-lg leading-relaxed mb-8">
              {protocol.description}
            </p>

            <div className="flex flex-wrap gap-5 text-sm font-sans text-[rgba(30,37,43,0.62)]">
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-accent" />
                <span>{protocol.durationMinutes} minutes</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Beaker className="w-4 h-4 text-accent" />
                <span>{protocol.steps.length} steps</span>
              </div>
              {protocol.ceEligible && protocol.ceCredits && (
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-accent" />
                  <span>{protocol.ceCredits} CE credits</span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-accent" />
                <span>{protocol.adoptionCount.toLocaleString()} professionals <span className="text-[rgba(30,37,43,0.4)] text-xs font-sans">(est.)</span></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Content ──────────────────────────────────────────── */}
      <section className="pb-16 lg:pb-24">
        <div className="section-container">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* ── Steps Column ── */}
            <div className="flex-1 min-w-0">
              <h2 className="font-sans text-subsection text-graphite mb-8">
                Step-by-Step Protocol
              </h2>

              <div className="space-y-8">
                {protocol.steps.map((step) => (
                  <div key={step.stepNumber} className="relative">
                    <div className="flex gap-5">
                      {/* Step number */}
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-sans text-sm font-bold ${catBg} ${catAccent}`}>
                          {step.stepNumber}
                        </div>
                        {step.stepNumber < protocol.steps.length && (
                          <div className="w-px h-full bg-[rgba(30,37,43,0.08)] mx-auto mt-2" />
                        )}
                      </div>

                      {/* Step content */}
                      <div className="flex-1 pb-4">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-sans text-lg font-semibold text-graphite">
                            {step.title}
                          </h3>
                          <span className="text-xs font-sans font-medium text-[rgba(30,37,43,0.42)] bg-mn-surface rounded-full px-2.5 py-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {step.durationMinutes} min
                          </span>
                        </div>

                        <p className="text-sm font-sans text-[rgba(30,37,43,0.62)] leading-relaxed mb-4">
                          {step.description}
                        </p>

                        {/* Products for this step */}
                        {step.products.length > 0 && (
                          <div className="bg-white/60 backdrop-blur-[12px] border border-white/30 rounded-2xl p-4 space-y-3">
                            <p className="text-xs font-sans font-semibold text-[rgba(30,37,43,0.42)] uppercase tracking-wide">
                              Products Used
                            </p>
                            {step.products.map((product, pIdx) => (
                              <div
                                key={pIdx}
                                className="flex items-start justify-between gap-3 text-sm"
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="font-sans font-medium text-graphite">
                                    {product.name}
                                  </p>
                                  <p className="text-xs font-sans text-accent font-medium">
                                    {product.brand}
                                  </p>
                                  <p className="text-xs font-sans text-[rgba(30,37,43,0.42)] mt-0.5">
                                    {product.usage}
                                  </p>
                                </div>
                                <a
                                  href="#"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    addToast('Product page coming soon', 'info');
                                  }}
                                  className="flex-shrink-0 text-xs font-sans font-medium text-accent hover:text-accent-hover transition-colors flex items-center gap-1 mt-0.5"
                                >
                                  View <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Sidebar ── */}
            <aside className="lg:w-80 flex-shrink-0 space-y-5">
              {/* Add All to Cart */}
              <div className="bg-white/60 backdrop-blur-[12px] border border-white/30 rounded-2xl p-6">
                <button
                  onClick={handleAddAllToCart}
                  className="w-full inline-flex items-center justify-center gap-2 bg-[#1F2428] text-[#F7F5F2] font-sans font-medium rounded-full h-[48px] px-6 text-sm transition-opacity hover:opacity-90"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add All Products to Cart
                </button>
                <p className="text-xs font-sans text-[rgba(30,37,43,0.42)] text-center mt-3">
                  {uniqueProducts.length} products from {protocol.steps.length} steps
                </p>
              </div>

              {/* CE Credit Card */}
              {protocol.ceEligible && protocol.ceCredits && (
                <div className="bg-accent/[0.06] rounded-card border border-accent/20 p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <GraduationCap className="w-5 h-5 text-accent" />
                    <h3 className="font-sans text-base font-semibold text-graphite">
                      CE Credits
                    </h3>
                  </div>
                  <p className="text-metric-md font-sans text-graphite mb-1">
                    {protocol.ceCredits}
                  </p>
                  <p className="text-sm font-sans text-[rgba(30,37,43,0.62)] mb-4">
                    credits upon completion
                  </p>
                  <button
                    onClick={handleDownloadCertificate}
                    className="w-full inline-flex items-center justify-center gap-2 bg-accent/15 hover:bg-accent/25 text-graphite font-sans font-medium px-4 py-2.5 rounded-full text-sm transition-colors"
                  >
                    Download Certificate
                  </button>
                </div>
              )}

              {/* Skin Concerns */}
              {protocol.skinConcerns.length > 0 && (
                <div className="bg-white/60 backdrop-blur-[12px] border border-white/30 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="w-4 h-4 text-accent" />
                    <h3 className="font-sans text-base font-semibold text-graphite">
                      Skin Concerns
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {protocol.skinConcerns.map((concern) => (
                      <span
                        key={concern}
                        className="inline-block bg-mn-surface text-[rgba(30,37,43,0.62)] text-xs font-sans font-medium rounded-full px-3 py-1"
                      >
                        {concern}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Contraindications */}
              {protocol.contraindications.length > 0 && (
                <div className="bg-signal-down/[0.04] rounded-card border border-signal-down/20 p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-signal-down" />
                    <h3 className="font-sans text-base font-semibold text-signal-down">
                      Contraindications
                    </h3>
                  </div>
                  <ul className="space-y-2">
                    {protocol.contraindications.map((ci) => (
                      <li
                        key={ci}
                        className="text-sm font-sans text-signal-down/80 flex items-start gap-2"
                      >
                        <span className="w-1 h-1 rounded-full bg-signal-down mt-2 flex-shrink-0" />
                        {ci}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Social Proof */}
              <div className="bg-white rounded-card border border-[rgba(30,37,43,0.06)] p-6 text-center shadow-soft">
                <Users className="w-6 h-6 text-accent mx-auto mb-2" />
                <p className="text-metric-md font-sans text-graphite">
                  {protocol.adoptionCount.toLocaleString()}
                </p>
                <p className="text-sm font-sans text-[rgba(30,37,43,0.62)] mt-1">
                  professionals use this protocol <span className="text-[rgba(30,37,43,0.4)] text-xs">(est.)</span>
                </p>
              </div>

              {/* Related Protocols */}
              {relatedFilled.length > 0 && (
                <div className="bg-white/60 backdrop-blur-[12px] border border-white/30 rounded-2xl p-6">
                  <h3 className="font-sans text-base font-semibold text-graphite mb-4">
                    Related Protocols
                  </h3>
                  <div className="space-y-3">
                    {relatedFilled.map((rel) => {
                      const relCatBg = CATEGORY_BG[rel.category];
                      const relCatAccent = CATEGORY_ACCENT[rel.category];
                      return (
                        <Link
                          key={rel.id}
                          to={`/protocols/${rel.slug}`}
                          className="block group"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${relCatBg}`}>
                              <Beaker className={`w-3.5 h-3.5 ${relCatAccent}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-sans font-medium text-graphite group-hover:text-accent transition-colors truncate">
                                {rel.title}
                              </p>
                              <p className="text-xs font-sans text-[rgba(30,37,43,0.42)]">
                                {rel.durationMinutes} min
                                {rel.ceCredits ? ` / ${rel.ceCredits} CE` : ''}
                              </p>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-[rgba(30,37,43,0.22)] group-hover:text-accent transition-colors flex-shrink-0 mt-0.5" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <SiteFooter />
    </div>
  );
}
