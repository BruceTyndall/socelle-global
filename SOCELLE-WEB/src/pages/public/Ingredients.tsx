import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Search, Beaker, FlaskConical } from 'lucide-react';
import MainNav from '../../components/MainNav';
import SiteFooter from '../../components/sections/SiteFooter';
import { useIngredients } from '../../lib/useIngredients';
import type { Ingredient } from '../../lib/useIngredients';

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
    <article className="bg-white rounded-2xl border border-graphite/10 p-5 shadow-card hover:shadow-card-hover transition-shadow flex flex-col gap-3">
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
    </article>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function Ingredients() {
  const [searchInput, setSearchInput] = useState('');
  const { ingredients, loading, isLive, total } = useIngredients(searchInput, 60);

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
        <link rel="canonical" href="https://socelle.com/ingredients" />
      </Helmet>
      <MainNav />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative bg-mn-dark py-20 lg:py-28 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
        <div className="section-container text-center relative">
          <p className="text-accent text-[11px] font-sans font-medium tracking-[0.25em] uppercase mb-4">
            Ingredient Intelligence
          </p>
          <h1 className="font-sans font-semibold text-4xl lg:text-5xl text-[#F7F5F2] leading-tight tracking-tight mb-5">
            INCI Ingredient Directory
          </h1>
          <div className="mx-auto w-10 h-px bg-accent/40 mb-6" />
          <p className="text-[rgba(247,245,242,0.60)] font-sans font-light text-lg max-w-xl mx-auto">
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
