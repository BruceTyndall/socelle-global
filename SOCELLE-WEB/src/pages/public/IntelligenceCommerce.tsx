// IntelligenceCommerce.tsx — /shop/intelligence — Intelligence-driven product recommendations
// V2-HUBS-10: Profit-first recommendations based on signal data
// Data: LIVE — products + market_signals tables
// Commerce is a MODULE, not the IA backbone (CLAUDE.md §M)
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  TrendingUp, Star, ShoppingBag, BarChart3, ArrowRight, Activity,
  DollarSign, FlaskConical,
} from 'lucide-react';
import MainNav from '../../components/MainNav';
import SiteFooter from '../../components/sections/SiteFooter';
import TrendingBadge from '../../components/commerce/TrendingBadge';
import AffiliateBadge from '../../components/commerce/AffiliateBadge';
import { useProducts } from '../../lib/shop/useProducts';
import { useProductSignals } from '../../lib/shop/useProductSignals';
import { formatCents } from '../../lib/shop/types';
import { useIntelligence } from '../../lib/intelligence/useIntelligence';

export default function IntelligenceCommerce() {
  const { products, loading: productsLoading } = useProducts({ per_page: 50, sort: 'featured' });
  const { matches, loading: signalsLoading } = useProductSignals(products);
  const { signals: marketSignals, loading: intelligenceLoading } = useIntelligence();

  const loading = productsLoading || signalsLoading || intelligenceLoading;

  // Products that match trending signals, sorted by magnitude
  const trendingProducts = useMemo(() => {
    if (matches.size === 0) return [];
    return products
      .filter(p => matches.has(p.id))
      .sort((a, b) => {
        const aMag = Math.abs(matches.get(a.id)?.magnitude ?? 0);
        const bMag = Math.abs(matches.get(b.id)?.magnitude ?? 0);
        return bMag - aMag;
      });
  }, [products, matches]);

  // Product-relevant signals (for the intelligence context section)
  const productSignals = useMemo(() => {
    return marketSignals
      .filter(
        s =>
          s.signal_type === 'product_velocity' ||
          s.signal_type === 'ingredient_momentum' ||
          s.signal_type === 'treatment_trend'
      )
      .slice(0, 6);
  }, [marketSignals]);

  // Featured products (those not matched to signals — still show them)
  const featuredProducts = useMemo(() => {
    return products
      .filter(p => p.is_featured && !matches.has(p.id))
      .slice(0, 4);
  }, [products, matches]);

  return (
    <>
      <Helmet>
        <title>Intelligence-Driven Products | SOCELLE</title>
        <meta
          name="description"
          content="Discover professional beauty products backed by market intelligence signals. See what is trending in your region."
        />
      </Helmet>
      <MainNav />

      <main className="min-h-screen bg-mn-bg">
        {/* Hero — Intelligence-first framing, NOT commerce-first */}
        <section className="bg-mn-dark py-16 lg:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
            <p className="text-eyebrow text-accent mb-4">Market Intelligence + Products</p>
            <h1 className="text-section text-white mb-4">
              Products Backed by Market Signals
            </h1>
            <p className="text-body text-white/60 max-w-2xl mx-auto">
              Every recommendation below is connected to live market intelligence.
              See which products align with trending treatments, rising ingredients,
              and shifting demand in your market.
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          {/* Intelligence Context Strip */}
          {productSignals.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center gap-2 mb-6">
                <Activity className="w-5 h-5 text-accent" />
                <h2 className="text-lg font-sans font-semibold text-graphite">Active Market Signals</h2>
                <Link
                  to="/intelligence"
                  className="ml-auto text-sm font-sans text-accent hover:text-accent-hover transition-colors flex items-center gap-1"
                >
                  View Full Intelligence <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {productSignals.map(signal => (
                  <div
                    key={signal.id}
                    className="bg-mn-card rounded-card p-4 shadow-soft border-l-3 border-l-accent"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-sans font-semibold uppercase tracking-wider text-graphite/50 mb-1">
                          {signal.signal_type.replace(/_/g, ' ')}
                        </p>
                        <p className="text-sm font-sans font-semibold text-graphite line-clamp-2">
                          {signal.title}
                        </p>
                      </div>
                      <TrendingBadge
                        direction={signal.direction}
                        magnitude={signal.magnitude}
                        size="sm"
                      />
                    </div>
                    {signal.region && (
                      <p className="text-xs font-sans text-graphite/50 mt-2">{signal.region}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Trending Products — Intelligence-matched */}
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-signal-up" />
              <h2 className="text-lg font-sans font-semibold text-graphite">
                Signal-Matched Products
              </h2>
              <span className="text-xs font-sans text-graphite/40 ml-2">
                Products aligned with active market signals
              </span>
            </div>

            {loading && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-mn-card rounded-card p-4 animate-pulse">
                    <div className="aspect-square bg-graphite/5 rounded-xl mb-4" />
                    <div className="h-4 bg-graphite/5 rounded mb-2 w-3/4" />
                    <div className="h-4 bg-graphite/5 rounded w-1/2" />
                  </div>
                ))}
              </div>
            )}

            {!loading && trendingProducts.length === 0 && (
              <div className="text-center py-16 bg-mn-card rounded-card">
                <BarChart3 className="w-12 h-12 text-graphite/15 mx-auto mb-4" />
                <p className="text-lg font-sans text-graphite/60">No signal-matched products yet</p>
                <p className="text-sm font-sans text-graphite/40 mt-1 max-w-md mx-auto">
                  As market intelligence signals connect to products in our catalog,
                  intelligence-matched recommendations will appear here.
                </p>
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 h-10 px-5 bg-mn-dark text-white text-sm font-sans font-semibold rounded-pill hover:bg-graphite transition-colors mt-6"
                >
                  Browse All Products
                </Link>
              </div>
            )}

            {!loading && trendingProducts.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {trendingProducts.map(product => {
                  const match = matches.get(product.id);
                  const images = (product.images as string[]) ?? [];
                  const firstImage = images[0] ?? '/placeholder-product.svg';
                  const hasAffiliate = !!(product as Record<string, unknown>).affiliate_url;

                  return (
                    <div
                      key={product.id}
                      className="group bg-mn-card rounded-card overflow-hidden shadow-soft hover:shadow-panel transition-shadow relative"
                    >
                      {/* Trending Badge */}
                      {match && (
                        <div className="absolute top-3 left-3 z-10">
                          <TrendingBadge
                            direction={match.direction}
                            magnitude={match.magnitude}
                            size="sm"
                          />
                        </div>
                      )}

                      <Link to={`/shop/${product.slug}`} className="block">
                        <div className="aspect-square bg-mn-surface overflow-hidden">
                          <img
                            src={firstImage}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      </Link>
                      <div className="p-4">
                        <Link to={`/shop/${product.slug}`}>
                          <h3 className="text-sm font-sans font-semibold text-graphite line-clamp-2 mb-1 group-hover:text-accent transition-colors">
                            {product.name}
                          </h3>
                        </Link>

                        {/* Intelligence context snippet */}
                        {match && (
                          <p className="text-[11px] font-sans text-accent/80 line-clamp-1 mb-2">
                            {match.signalTitle}
                          </p>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="text-sm font-sans font-bold text-graphite">
                            {formatCents(product.price_cents)}
                          </span>
                          {product.compare_at_price_cents &&
                            product.compare_at_price_cents > product.price_cents && (
                              <span className="text-xs font-sans text-graphite/40 line-through">
                                {formatCents(product.compare_at_price_cents)}
                              </span>
                            )}
                        </div>

                        {/* FTC Affiliate Badge — shown when product has affiliate link */}
                        {hasAffiliate && (
                          <div className="mt-2">
                            <AffiliateBadge size="sm" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Featured Products (non-signal-matched) */}
          {featuredProducts.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center gap-2 mb-6">
                <Star className="w-5 h-5 text-signal-warn" />
                <h2 className="text-lg font-sans font-semibold text-graphite">Featured Products</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {featuredProducts.map(product => {
                  const images = (product.images as string[]) ?? [];
                  return (
                    <Link
                      key={product.id}
                      to={`/shop/${product.slug}`}
                      className="group bg-mn-card rounded-card overflow-hidden shadow-soft hover:shadow-panel transition-shadow"
                    >
                      <div className="aspect-square bg-mn-surface overflow-hidden">
                        <img
                          src={images[0] ?? '/placeholder-product.svg'}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="text-sm font-sans font-semibold text-graphite line-clamp-2 mb-1">
                          {product.name}
                        </h3>
                        <span className="text-sm font-sans font-bold text-graphite">
                          {formatCents(product.price_cents)}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* Landing Cost Calculator Placeholder */}
          <section className="mb-12">
            <div className="bg-mn-card rounded-card p-8 shadow-soft border border-graphite/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h2 className="text-lg font-sans font-semibold text-graphite">
                    Landing Cost Calculator
                  </h2>
                  <p className="text-sm font-sans text-graphite/50">
                    Compare product costs across distributors
                  </p>
                </div>
                <span className="ml-auto text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-pill">
                  DEMO
                </span>
              </div>
              <p className="text-sm font-sans text-graphite/60 mb-4">
                The landing cost calculator will help you compare total acquisition costs
                including wholesale price, shipping, minimum order quantities, and volume
                discounts across verified distributors.
              </p>
              <div className="grid sm:grid-cols-3 gap-4">
                {['Wholesale Price', 'Shipping + Handling', 'Volume Discount'].map(label => (
                  <div
                    key={label}
                    className="bg-mn-bg rounded-lg p-4 text-center border border-graphite/5"
                  >
                    <p className="text-xs font-sans font-semibold text-graphite/40 uppercase tracking-wider mb-2">
                      {label}
                    </p>
                    <p className="text-lg font-sans font-semibold text-graphite/20">--</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Ingredient Intelligence Link */}
          <section className="mb-12">
            <Link
              to="/ingredients"
              className="flex items-center gap-4 bg-mn-card rounded-card p-6 shadow-soft hover:shadow-panel transition-shadow border border-graphite/5 group"
            >
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <FlaskConical className="w-6 h-6 text-accent" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-sans font-semibold text-graphite group-hover:text-accent transition-colors">
                  Ingredient Intelligence
                </h3>
                <p className="text-sm font-sans text-graphite/60">
                  Explore trending ingredients, formulation signals, and product-ingredient connections.
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-graphite/30 group-hover:text-accent transition-colors" />
            </Link>
          </section>

          {/* Browse All */}
          <div className="text-center pb-8">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 h-11 px-6 border border-graphite/15 text-graphite text-sm font-sans font-semibold rounded-pill hover:bg-mn-surface transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              Browse Full Product Catalog
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
