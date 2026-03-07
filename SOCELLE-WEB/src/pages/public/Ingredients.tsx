import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Search, Beaker, FlaskConical, Layers, ArrowRight, Clock } from 'lucide-react';
import MainNav from '../../components/MainNav';
import SiteFooter from '../../components/sections/SiteFooter';
import { useIngredients } from '../../lib/useIngredients';
import type { Ingredient } from '../../lib/useIngredients';
import { useIngredientCollections } from '../../lib/useIngredientCollections';
import { useIngredientSearch } from '../../lib/useIngredientSearch';
import { inciToSlug } from '../../lib/useIngredientDetail';

// ── EU status badge ─────────────────────────────────────────────────────────

const EU_STATUS_STYLES: Record<string, { label: string; className: string }> = {
  allowed:    { label: 'EU Allowed',    className: 'bg-signal-up/10 text-signal-up' },
  restricted: { label: 'EU Restricted', className: 'bg-signal-warn/10 text-signal-warn' },
  banned:     { label: 'EU Banned',     className: 'bg-signal-down/10 text-signal-down' },
};

function EuBadge({ status }: { status: Ingredient['eu_status'] }) {
  if (!status) return null;
  const s = EU_STATUS_STYLES[status];
  if (!s) return null;
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-pill ${s.className}`}>
      {s.label}
    </span>
  );
}

// ── Ingredient card ─────────────────────────────────────────────────────────

function IngredientCard({ ingredient }: { ingredient: Ingredient }) {
  return (
    <Link
      to={`/ingredients/${inciToSlug(ingredient.inci_name)}`}
      className="bg-white rounded-2xl border border-graphite/10 p-5 shadow-card hover:shadow-card-hover transition-shadow flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-sans font-semibold text-sm text-graphite leading-snug">
            {ingredient.inci_name}
          </p>
          {ingredient.common_name && (
            <p className="text-graphite/50 font-sans text-xs mt-0.5">
              {ingredient.common_name}
            </p>
          )}
        </div>
        <EuBadge status={ingredient.eu_status} />
      </div>

      {ingredient.function.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {ingredient.function.slice(0, 4).map((fn) => (
            <span
              key={fn}
              className="text-[10px] font-sans font-medium bg-mn-surface text-graphite/60 px-2 py-0.5 rounded-pill"
            >
              {fn}
            </span>
          ))}
          {ingredient.function.length > 4 && (
            <span className="text-[10px] font-sans text-graphite/40">
              +{ingredient.function.length - 4} more
            </span>
          )}
        </div>
      )}

      {ingredient.description && (
        <p className="text-graphite/55 font-sans text-xs font-light leading-relaxed line-clamp-2">
          {ingredient.description}
        </p>
      )}

      {ingredient.cas_number && (
        <p className="text-graphite/30 font-sans text-[10px] mt-auto">
          CAS {ingredient.cas_number}
        </p>
      )}
    </Link>
  );
}

// ── Browse by function categories ───────────────────────────────────────────

const FUNCTION_CATEGORIES = [
  { label: 'Actives', value: 'actives', icon: '🧪' },
  { label: 'Humectants', value: 'humectants', icon: '💧' },
  { label: 'Occlusives', value: 'occlusives', icon: '🛡' },
  { label: 'Emollients', value: 'emollients', icon: '🧴' },
  { label: 'Preservatives', value: 'preservatives', icon: '🔬' },
  { label: 'Exfoliants', value: 'exfoliants', icon: '✨' },
  { label: 'Antioxidants', value: 'antioxidants', icon: '🍇' },
];

// ── Page ────────────────────────────────────────────────────────────────────

export default function Ingredients() {
  const [searchInput, setSearchInput] = useState('');
  const { ingredients, loading, isLive, total } = useIngredients(searchInput, 60);
  const { collections: featuredCollections, isLive: collectionsLive } = useIngredientCollections({ featured: true });
  const { results: recentIngredients, isLive: recentLive } = useIngredientSearch({ q: '', limit: 8 });

  return (
    <div className="min-h-screen bg-mn-bg font-sans">
      <Helmet>
        <title>Ingredient Directory — INCI Reference | Socelle</title>
        <meta
          name="description"
          content="Professional beauty ingredient reference. Search the INCI registry for functions, EU regulatory status, and safety data — sourced from Open Beauty Facts."
        />
        <meta property="og:title" content="Ingredient Directory — Socelle" />
        <meta
          property="og:description"
          content="INCI ingredient reference for professional beauty operators. EU status, functions, and safety intelligence."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://socelle.com/ingredients" />
        <meta property="og:image" content="https://socelle.com/og-image.svg" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://socelle.com/ingredients" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Ingredient Directory — INCI Reference | Socelle',
          description: 'Professional beauty ingredient reference. Search the INCI registry for functions, EU regulatory status, and safety data.',
          url: 'https://socelle.com/ingredients',
          isPartOf: { '@type': 'WebSite', url: 'https://socelle.com', name: 'Socelle' },
        })}</script>
      </Helmet>
      <MainNav />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative bg-mn-dark py-20 lg:py-28 overflow-hidden">
        <video
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-[0.08]"
          aria-hidden="true"
        >
          <source src="/videos/brand/blue drops.mp4" type="video/mp4" />
        </video>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
        <div className="section-container text-center relative z-10">
          <p className="text-accent text-[11px] font-sans font-medium tracking-[0.25em] uppercase mb-4">
            Ingredient Intelligence
          </p>
          <h1 className="font-sans font-semibold text-4xl lg:text-5xl text-mn-bg leading-tight tracking-tight mb-5">
            INCI Ingredient Directory
          </h1>
          <div className="mx-auto w-10 h-px bg-accent/40 mb-6" />
          <p className="text-mn-bg/60 font-sans font-light text-lg max-w-xl mx-auto">
            Search the professional beauty ingredient registry — functions, EU regulatory status,
            and provenance sourced from Open Beauty Facts.
          </p>
        </div>
      </section>

      {/* ── Search ───────────────────────────────────────────────────── */}
      <section className="py-10 border-b border-graphite/10 bg-mn-surface">
        <div className="section-container max-w-2xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-graphite/40 pointer-events-none" />
            <input
              type="search"
              placeholder="Search by INCI name or common name…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-graphite/15 rounded-xl font-sans text-sm text-graphite placeholder:text-graphite/35 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50"
            />
          </div>
          {isLive && !loading && (
            <p className="text-graphite/40 font-sans text-xs mt-3 text-center">
              {total.toLocaleString()} ingredients in directory
              {searchInput && ` · ${ingredients.length} matching "${searchInput}"`}
            </p>
          )}
        </div>
      </section>

      {/* ── Directory ────────────────────────────────────────────────── */}
      <section className="py-16 lg:py-24">
        <div className="section-container">
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-graphite/10 p-5 animate-pulse"
                >
                  <div className="h-4 w-3/4 bg-graphite/10 rounded mb-2" />
                  <div className="h-3 w-1/2 bg-graphite/5 rounded mb-4" />
                  <div className="flex gap-1.5">
                    <div className="h-4 w-16 bg-graphite/8 rounded-pill" />
                    <div className="h-4 w-14 bg-graphite/8 rounded-pill" />
                  </div>
                </div>
              ))}
            </div>
          ) : ingredients.length === 0 ? (
            <div className="text-center py-24">
              <FlaskConical className="w-10 h-10 text-graphite/20 mx-auto mb-4" />
              <p className="font-sans font-semibold text-graphite/40 mb-1">
                {searchInput ? 'No ingredients match your search' : 'No ingredients loaded yet'}
              </p>
              <p className="font-sans text-graphite/30 text-sm">
                {searchInput
                  ? 'Try a different INCI name or common name.'
                  : 'The ingredient directory populates when the Open Beauty Facts sync has run.'}
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-8">
                <Beaker className="w-5 h-5 text-accent" />
                <h2 className="font-sans font-semibold text-2xl text-graphite">
                  {searchInput ? `Results for "${searchInput}"` : 'All Ingredients'}
                </h2>
                {isLive && (
                  <span className="text-[10px] font-semibold bg-signal-up/10 text-signal-up px-2 py-0.5 rounded-pill">
                    Live
                  </span>
                )}
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {ingredients.map((ingredient) => (
                  <IngredientCard key={ingredient.id} ingredient={ingredient} />
                ))}
              </div>
              {ingredients.length === 60 && (
                <p className="text-center text-graphite/35 font-sans text-xs mt-10">
                  Showing first 60 results. Refine your search to narrow results.
                </p>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── Featured Collections ─────────────────────────────────────── */}
      {featuredCollections.length > 0 && (
        <section className="py-16 lg:py-20 bg-mn-surface border-t border-graphite/10">
          <div className="section-container">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <Layers className="w-5 h-5 text-accent" />
                <h2 className="font-sans font-semibold text-2xl text-graphite">Featured Collections</h2>
                {collectionsLive ? (
                  <span className="text-[10px] font-semibold bg-signal-up/10 text-signal-up px-2 py-0.5 rounded-pill">LIVE</span>
                ) : (
                  <span className="text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-pill">DEMO</span>
                )}
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredCollections.map((col) => (
                <Link
                  key={col.id}
                  to={`/ingredients/collections/${col.slug}`}
                  className="bg-white rounded-2xl border border-graphite/10 p-5 shadow-card hover:shadow-card-hover transition-shadow flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-sans font-semibold text-sm text-graphite">{col.name}</h3>
                    <ArrowRight className="w-4 h-4 text-graphite/30" />
                  </div>
                  {col.description && (
                    <p className="text-graphite/50 font-sans text-xs line-clamp-2">{col.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-auto pt-2">
                    {col.collection_type && (
                      <span className="text-[10px] font-sans font-medium bg-accent/10 text-accent px-2 py-0.5 rounded-pill capitalize">
                        {col.collection_type}
                      </span>
                    )}
                    <span className="text-[10px] font-sans text-graphite/40">
                      {col.item_count ?? 0} ingredients
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Browse by Function ─────────────────────────────────────────── */}
      <section className="py-16 lg:py-20 border-t border-graphite/10">
        <div className="section-container">
          <div className="flex items-center gap-3 mb-8">
            <FlaskConical className="w-5 h-5 text-accent" />
            <h2 className="font-sans font-semibold text-2xl text-graphite">Browse by Function</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
            {FUNCTION_CATEGORIES.map((cat) => (
              <Link
                key={cat.value}
                to={`/ingredients/collections/${cat.value}`}
                className="bg-white rounded-2xl border border-graphite/10 p-4 text-center shadow-card hover:shadow-card-hover transition-shadow"
              >
                <span className="text-2xl block mb-2" role="img" aria-label={cat.label}>{cat.icon}</span>
                <span className="font-sans font-medium text-sm text-graphite">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Recently Added ─────────────────────────────────────────────── */}
      {recentIngredients.length > 0 && !searchInput && (
        <section className="py-16 lg:py-20 bg-mn-surface border-t border-graphite/10">
          <div className="section-container">
            <div className="flex items-center gap-3 mb-8">
              <Clock className="w-5 h-5 text-accent" />
              <h2 className="font-sans font-semibold text-2xl text-graphite">Trending Ingredients</h2>
              {recentLive ? (
                <span className="text-[10px] font-semibold bg-signal-up/10 text-signal-up px-2 py-0.5 rounded-pill">LIVE</span>
              ) : (
                <span className="text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-pill">DEMO</span>
              )}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentIngredients.map((ing) => (
                <Link
                  key={ing.id}
                  to={`/ingredients/${inciToSlug(ing.inci_name)}`}
                  className="bg-white rounded-2xl border border-graphite/10 p-5 shadow-card hover:shadow-card-hover transition-shadow flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-sans font-semibold text-sm text-graphite leading-snug">{ing.inci_name}</p>
                    {ing.ewg_score != null && (
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-pill ${
                        ing.ewg_score <= 2
                          ? 'bg-signal-up/10 text-signal-up'
                          : ing.ewg_score <= 6
                            ? 'bg-signal-warn/10 text-signal-warn'
                            : 'bg-signal-down/10 text-signal-down'
                      }`}>
                        EWG {ing.ewg_score}
                      </span>
                    )}
                  </div>
                  {ing.common_name && (
                    <p className="text-graphite/50 font-sans text-xs">{ing.common_name}</p>
                  )}
                  {ing.benefits.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {ing.benefits.slice(0, 2).map((b) => (
                        <span key={b} className="text-[10px] font-sans font-medium bg-signal-up/10 text-signal-up px-2 py-0.5 rounded-pill">
                          {b}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Provenance ───────────────────────────────────────────────── */}
      <section className="py-10 border-t border-graphite/10 bg-mn-surface">
        <div className="section-container text-center">
          <p className="font-sans text-graphite/40 text-xs">
            Ingredient data sourced from{' '}
            <span className="font-medium text-graphite/55">Open Beauty Facts</span>
            {' '}(open database, CC-BY-SA licence). EU regulatory status per CosIng.
            Safety scores are populated by W11-06 (openFDA) and may not yet be available.
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
