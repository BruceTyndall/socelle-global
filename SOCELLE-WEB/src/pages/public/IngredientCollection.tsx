import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ChevronRight, FlaskConical } from 'lucide-react';
import MainNav from '../../components/MainNav';
import SiteFooter from '../../components/sections/SiteFooter';
import { useCollectionDetail } from '../../lib/useIngredientCollections';
import { inciToSlug } from '../../lib/useIngredientDetail';

// ── EWG Mini Badge ──────────────────────────────────────────────────────────

function EwgMini({ score }: { score: number | null }) {
  if (score == null) return null;
  const color =
    score <= 2
      ? 'bg-signal-up/10 text-signal-up'
      : score <= 6
        ? 'bg-signal-warn/10 text-signal-warn'
        : 'bg-signal-down/10 text-signal-down';
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-pill ${color}`}>
      EWG {score}
    </span>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function IngredientCollection() {
  const { slug = '' } = useParams<{ slug: string }>();
  const { collection, ingredients, loading, isLive, notFound } = useCollectionDetail(slug);

  const pageTitle = collection
    ? `${collection.name} — Ingredient Collection | Socelle`
    : 'Ingredient Collection | Socelle';

  return (
    <div className="min-h-screen bg-mn-bg font-sans">
      <Helmet>
        <title>{pageTitle}</title>
        <meta
          name="description"
          content={collection?.description || 'Curated ingredient collection for professional beauty operators.'}
        />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={collection?.description || 'Curated ingredient collection for professional beauty operators.'} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://socelle.com/ingredients/collections/${slug}`} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`https://socelle.com/ingredients/collections/${slug}`} />
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
              {collection?.name || 'Collection'}
            </span>
          </nav>
        </div>
      </div>

      <section className="py-12 lg:py-20">
        <div className="section-container">
          {loading ? (
            <div className="space-y-6 animate-pulse">
              <div className="h-8 w-1/2 bg-graphite/10 rounded" />
              <div className="h-5 w-3/4 bg-graphite/5 rounded" />
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-32 bg-graphite/5 rounded-2xl" />
                ))}
              </div>
            </div>
          ) : notFound || !collection ? (
            <div className="text-center py-24">
              <FlaskConical className="w-10 h-10 text-graphite/20 mx-auto mb-4" />
              <p className="font-sans font-semibold text-graphite/40 mb-1">Collection not found</p>
              <Link
                to="/ingredients"
                className="inline-flex items-center justify-center h-[44px] px-6 bg-mn-dark text-mn-bg text-sm font-sans font-semibold rounded-full hover:bg-mn-dark/90 transition-colors mt-4"
              >
                Back to Directory
              </Link>
            </div>
          ) : (
            <>
              {/* Hero */}
              <div className="mb-10 flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h1 className="font-sans font-semibold text-3xl lg:text-4xl text-graphite tracking-tight">
                    {collection.name}
                  </h1>
                  {collection.description && (
                    <p className="text-graphite/50 font-sans text-lg mt-2 max-w-2xl">{collection.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {collection.collection_type && (
                    <span className="text-[10px] font-semibold bg-accent/10 text-accent px-2.5 py-0.5 rounded-pill capitalize">
                      {collection.collection_type}
                    </span>
                  )}
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

              {/* Ingredients Grid */}
              {ingredients.length === 0 ? (
                <p className="text-center text-graphite/40 font-sans text-sm py-12">
                  No ingredients in this collection yet.
                </p>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {ingredients.map((ing) => (
                    <Link
                      key={ing.id}
                      to={`/ingredients/${inciToSlug(ing.inci_name)}`}
                      className="bg-white rounded-2xl border border-graphite/10 p-5 shadow-card hover:shadow-card-hover transition-shadow flex flex-col gap-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-sans font-semibold text-sm text-graphite leading-snug">
                            {ing.inci_name}
                          </p>
                          {ing.common_name && (
                            <p className="text-graphite/50 font-sans text-xs mt-0.5">{ing.common_name}</p>
                          )}
                        </div>
                        <EwgMini score={ing.ewg_score} />
                      </div>
                      {ing.benefits.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {ing.benefits.slice(0, 3).map((b) => (
                            <span key={b} className="text-[10px] font-sans font-medium bg-signal-up/10 text-signal-up px-2 py-0.5 rounded-pill">
                              {b}
                            </span>
                          ))}
                        </div>
                      )}
                      {ing.function.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {ing.function.slice(0, 3).map((fn) => (
                            <span key={fn} className="text-[10px] font-sans font-medium bg-mn-surface text-graphite/60 px-2 py-0.5 rounded-pill">
                              {fn}
                            </span>
                          ))}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
