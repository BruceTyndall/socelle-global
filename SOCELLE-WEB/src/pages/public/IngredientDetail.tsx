import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  ChevronRight,
  Check,
  X,
  AlertTriangle,
  Leaf,
  Heart,
  Sparkles,
  FlaskConical,
  Droplets,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useState } from 'react';
import MainNav from '../../components/MainNav';
import SiteFooter from '../../components/sections/SiteFooter';
import { useIngredientDetail, inciToSlug } from '../../lib/useIngredientDetail';

// ── EWG Score Badge ─────────────────────────────────────────────────────────

function EwgBadge({ score }: { score: number | null }) {
  if (score == null) return null;
  const color =
    score <= 2
      ? 'bg-signal-up/10 text-signal-up border-signal-up/20'
      : score <= 6
        ? 'bg-signal-warn/10 text-signal-warn border-signal-warn/20'
        : 'bg-signal-down/10 text-signal-down border-signal-down/20';
  return (
    <div className={`inline-flex flex-col items-center rounded-2xl border px-5 py-3 ${color}`}>
      <span className="text-3xl font-sans font-bold leading-none">{score}</span>
      <span className="text-[10px] font-semibold uppercase tracking-wider mt-1">EWG</span>
    </div>
  );
}

// ── Comedogenic Dots ────────────────────────────────────────────────────────

function ComedogenicDots({ rating }: { rating: number | null }) {
  if (rating == null) return null;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-sans text-graphite/50">Comedogenic:</span>
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`w-2.5 h-2.5 rounded-full ${
              i <= rating ? 'bg-signal-warn' : 'bg-graphite/10'
            }`}
          />
        ))}
      </div>
      <span className="text-xs font-sans text-graphite/40">{rating}/5</span>
    </div>
  );
}

// ── Interaction Type Badge ──────────────────────────────────────────────────

function InteractionBadge({ type }: { type: string }) {
  const styles: Record<string, string> = {
    synergistic: 'bg-signal-up/10 text-signal-up',
    avoid: 'bg-signal-down/10 text-signal-down',
    caution: 'bg-signal-warn/10 text-signal-warn',
    neutral: 'bg-graphite/10 text-graphite/60',
  };
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-pill capitalize ${styles[type] || styles.neutral}`}>
      {type}
    </span>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function IngredientDetail() {
  const { slug = '' } = useParams<{ slug: string }>();
  const { ingredient, aliases, interactions, loading, isLive, notFound } = useIngredientDetail(slug);
  const [aliasOpen, setAliasOpen] = useState(false);

  const pageTitle = ingredient
    ? `${ingredient.common_name || ingredient.inci_name} — Ingredient Profile | Socelle`
    : 'Ingredient Profile | Socelle';

  const pageDesc = ingredient
    ? `${ingredient.inci_name} ingredient profile — EWG score, comedogenic rating, skin type suitability, and interaction data. Professional beauty intelligence.`
    : 'Ingredient intelligence for professional beauty operators.';

  return (
    <div className="min-h-screen bg-mn-bg font-sans">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDesc} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://socelle.com/ingredients/${slug}`} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`https://socelle.com/ingredients/${slug}`} />
        {ingredient && (
          <script type="application/ld+json">{JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Thing',
            name: ingredient.inci_name,
            alternateName: ingredient.common_name ?? undefined,
            description: ingredient.description ?? pageDesc,
            url: `https://socelle.com/ingredients/${slug}`,
            identifier: ingredient.cas_number ?? undefined,
          })}</script>
        )}
      </Helmet>
      <MainNav />

      {/* Breadcrumb */}
      <div className="bg-mn-surface border-b border-graphite/10">
        <div className="section-container py-3">
          <nav className="flex items-center gap-1.5 text-xs font-sans text-graphite/40">
            <Link to="/" className="hover:text-graphite/60 transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/ingredients" className="hover:text-graphite/60 transition-colors">Ingredients</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-graphite/70 font-medium">
              {ingredient?.common_name || ingredient?.inci_name || 'Loading...'}
            </span>
          </nav>
        </div>
      </div>

      <section className="py-12 lg:py-20">
        <div className="section-container max-w-4xl">
          {loading ? (
            <div className="space-y-6 animate-pulse">
              <div className="h-8 w-2/3 bg-graphite/10 rounded" />
              <div className="h-5 w-1/3 bg-graphite/5 rounded" />
              <div className="h-40 bg-graphite/5 rounded-2xl" />
            </div>
          ) : notFound || !ingredient ? (
            <div className="text-center py-24">
              <FlaskConical className="w-10 h-10 text-graphite/20 mx-auto mb-4" />
              <p className="font-sans font-semibold text-graphite/40 mb-1">Ingredient not found</p>
              <p className="font-sans text-graphite/30 text-sm mb-6">
                This ingredient may not exist in the directory yet.
              </p>
              <Link
                to="/ingredients"
                className="inline-flex items-center justify-center h-[44px] px-6 bg-mn-dark text-mn-bg text-sm font-sans font-semibold rounded-full hover:bg-mn-dark/90 transition-colors"
              >
                Back to Directory
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {/* ── Header ── */}
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="font-sans font-semibold text-3xl lg:text-4xl text-graphite tracking-tight uppercase">
                    {ingredient.inci_name}
                  </h1>
                  {ingredient.common_name && (
                    <p className="text-graphite/50 font-sans text-lg mt-1">{ingredient.common_name}</p>
                  )}
                  {ingredient.cas_number && (
                    <p className="text-graphite/30 font-sans text-xs mt-2">CAS {ingredient.cas_number}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <EwgBadge score={ingredient.ewg_score} />
                  {isLive ? (
                    <span className="text-[10px] font-semibold bg-signal-up/10 text-signal-up px-2 py-0.5 rounded-pill">
                      LIVE
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-pill">
                      DEMO
                    </span>
                  )}
                </div>
              </div>

              {/* ── Profile Card ── */}
              <div className="bg-white rounded-card border border-graphite/10 p-6 lg:p-8 shadow-card space-y-6">
                {/* Comedogenic */}
                <ComedogenicDots rating={ingredient.comedogenic_rating} />

                {/* Functions */}
                {ingredient.function.length > 0 && (
                  <div>
                    <p className="text-xs font-sans font-semibold text-graphite/50 uppercase tracking-wider mb-2">Functions</p>
                    <div className="flex flex-wrap gap-1.5">
                      {ingredient.function.map((fn) => (
                        <span key={fn} className="text-xs font-sans font-medium bg-mn-surface text-graphite/70 px-3 py-1 rounded-pill">
                          {fn}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Benefits */}
                {ingredient.benefits.length > 0 && (
                  <div>
                    <p className="text-xs font-sans font-semibold text-graphite/50 uppercase tracking-wider mb-2">Benefits</p>
                    <div className="flex flex-wrap gap-1.5">
                      {ingredient.benefits.map((b) => (
                        <span key={b} className="text-xs font-sans font-medium bg-signal-up/10 text-signal-up px-3 py-1 rounded-pill">
                          {b}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Concerns */}
                {ingredient.concerns.length > 0 && (
                  <div>
                    <p className="text-xs font-sans font-semibold text-graphite/50 uppercase tracking-wider mb-2">Concerns</p>
                    <div className="flex flex-wrap gap-1.5">
                      {ingredient.concerns.map((c) => (
                        <span key={c} className="text-xs font-sans font-medium bg-signal-warn/10 text-signal-warn px-3 py-1 rounded-pill">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skin Types */}
                {ingredient.skin_types.length > 0 && (
                  <div>
                    <p className="text-xs font-sans font-semibold text-graphite/50 uppercase tracking-wider mb-2">Skin Type Suitability</p>
                    <div className="flex flex-wrap gap-3">
                      {['oily', 'dry', 'combination', 'sensitive', 'normal', 'all'].map((st) => {
                        const suitable = ingredient.skin_types.includes(st);
                        return (
                          <div key={st} className="flex items-center gap-1.5">
                            {suitable ? (
                              <Check className="w-3.5 h-3.5 text-signal-up" />
                            ) : (
                              <X className="w-3.5 h-3.5 text-graphite/20" />
                            )}
                            <span className={`text-xs font-sans capitalize ${suitable ? 'text-graphite/70' : 'text-graphite/30'}`}>
                              {st}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Badges Row */}
                <div className="flex flex-wrap gap-2">
                  {ingredient.is_vegan && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-signal-up/10 text-signal-up px-2.5 py-1 rounded-pill">
                      <Leaf className="w-3 h-3" /> Vegan
                    </span>
                  )}
                  {ingredient.is_cruelty_free && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-signal-up/10 text-signal-up px-2.5 py-1 rounded-pill">
                      <Heart className="w-3 h-3" /> Cruelty-Free
                    </span>
                  )}
                  {ingredient.is_natural && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-signal-up/10 text-signal-up px-2.5 py-1 rounded-pill">
                      <Sparkles className="w-3 h-3" /> Natural
                    </span>
                  )}
                  {ingredient.is_fragrance && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2.5 py-1 rounded-pill">
                      <Droplets className="w-3 h-3" /> Fragrance
                    </span>
                  )}
                  {ingredient.is_allergen && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-signal-down/10 text-signal-down px-2.5 py-1 rounded-pill">
                      <ShieldAlert className="w-3 h-3" /> Allergen
                    </span>
                  )}
                </div>

                {/* Restricted Regions Warning */}
                {ingredient.restricted_regions.length > 0 && (
                  <div className="bg-signal-warn/10 border border-signal-warn/20 rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-signal-warn flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-sans font-semibold text-signal-warn mb-1">Regulatory Restrictions</p>
                      <p className="text-xs font-sans text-graphite/60">
                        This ingredient has restrictions in: {ingredient.restricted_regions.join(', ')}
                      </p>
                    </div>
                  </div>
                )}

                {/* Description */}
                {ingredient.description && (
                  <div>
                    <p className="text-xs font-sans font-semibold text-graphite/50 uppercase tracking-wider mb-2">Description</p>
                    <p className="text-sm font-sans text-graphite/70 leading-relaxed">{ingredient.description}</p>
                  </div>
                )}
              </div>

              {/* ── Aliases ── */}
              {aliases.length > 0 && (
                <div className="bg-white rounded-card border border-graphite/10 shadow-card overflow-hidden">
                  <button
                    onClick={() => setAliasOpen(!aliasOpen)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left"
                  >
                    <p className="text-sm font-sans font-semibold text-graphite">
                      Aliases ({aliases.length})
                    </p>
                    {aliasOpen ? (
                      <ChevronUp className="w-4 h-4 text-graphite/40" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-graphite/40" />
                    )}
                  </button>
                  {aliasOpen && (
                    <div className="px-6 pb-4 space-y-1.5">
                      {aliases.map((a) => (
                        <div key={a.id} className="flex items-center gap-3">
                          <span className="text-sm font-sans text-graphite/70">{a.alias}</span>
                          {a.alias_type && (
                            <span className="text-[10px] font-sans text-graphite/40 bg-mn-surface px-2 py-0.5 rounded-pill capitalize">
                              {a.alias_type.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── Interactions ── */}
              {interactions.length > 0 && (
                <div className="bg-white rounded-card border border-graphite/10 p-6 shadow-card">
                  <p className="text-sm font-sans font-semibold text-graphite mb-4">
                    Ingredient Interactions ({interactions.length})
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm font-sans">
                      <thead>
                        <tr className="border-b border-graphite/10">
                          <th className="text-left py-2 pr-4 text-xs font-semibold text-graphite/50 uppercase tracking-wider">Partner</th>
                          <th className="text-left py-2 pr-4 text-xs font-semibold text-graphite/50 uppercase tracking-wider">Type</th>
                          <th className="text-left py-2 text-xs font-semibold text-graphite/50 uppercase tracking-wider">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {interactions.map((inter) => (
                          <tr key={inter.id} className="border-b border-graphite/5">
                            <td className="py-2.5 pr-4">
                              <Link
                                to={`/ingredients/${inciToSlug(inter.partner_name)}`}
                                className="text-accent hover:text-accent-hover transition-colors font-medium"
                              >
                                {inter.partner_name}
                              </Link>
                            </td>
                            <td className="py-2.5 pr-4">
                              <InteractionBadge type={inter.interaction_type} />
                            </td>
                            <td className="py-2.5 text-graphite/60 text-xs">
                              {inter.explanation || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Provenance */}
      <section className="py-10 border-t border-graphite/10 bg-mn-surface">
        <div className="section-container text-center">
          <p className="font-sans text-graphite/40 text-xs">
            Ingredient data sourced from{' '}
            <span className="font-medium text-graphite/55">Open Beauty Facts</span>
            {' '}(open database, CC-BY-SA licence). EU regulatory status per CosIng.
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
