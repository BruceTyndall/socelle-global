import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, AlertCircle, Upload, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import BusinessNav from '../../components/BusinessNav';
import { BrandCardSkeleton } from '../../components/ui';
import BrandCard from '../../components/BrandCard';
import { getDemandSignal, getGrowthOpportunity } from '../../lib/intelligence/businessIntelligence';
import { TrendingUp, Zap, Brain } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  logo_url: string | null;
  website_url: string | null;
}

interface BrandStats {
  protocols: number;
  products: number;
  assets: number;
}

export default function PortalHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Logged-in users go straight to their dashboard
  useEffect(() => {
    if (user) {
      navigate('/portal/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const { data: brandsData, isLoading: loading, error: queryError, refetch: fetchBrands } = useQuery({
    queryKey: ['portal-brands'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .or('is_published.eq.true,status.eq.active')
        .order('name');

      if (error) throw error;

      const safeBrands = Array.isArray(data) ? data : [];

      const stats: Record<string, BrandStats> = {};
      await Promise.all(
        safeBrands.map(async (brand) => {
          const [protocolsRes, productsRes, assetsRes] = await Promise.all([
            supabase
              .from('canonical_protocols')
              .select('id', { count: 'exact', head: true })
              .eq('brand_id', brand.id),
            supabase
              .from('pro_products')
              .select('id', { count: 'exact', head: true })
              .eq('brand_id', brand.id),
            supabase
              .from('brand_assets')
              .select('id', { count: 'exact', head: true })
              .eq('brand_id', brand.id),
          ]);

          stats[brand.id] = {
            protocols: protocolsRes.count || 0,
            products: productsRes.count || 0,
            assets: assetsRes.count || 0,
          };
        })
      );

      return { brands: safeBrands as Brand[], brandStats: stats };
    },
  });

  const brands = brandsData?.brands ?? [];
  const brandStats = brandsData?.brandStats ?? {};
  const error = queryError ? 'Unable to load brands right now. Please try again.' : null;

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    brand.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // While checking auth, don't flash content
  if (user) return null;

  return (
    <>
      <BusinessNav />

      {/* Hero — for unauthenticated visitors */}
      <div className="bg-white border-b border-accent-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="max-w-2xl">
            <p className="text-xs font-sans font-semibold text-graphite/60 uppercase tracking-widest mb-4">
              Professional brand intelligence
            </p>
            <h1 className="text-3xl md:text-4xl font-sans text-graphite tracking-tight mb-4">
              Find brands built for your treatment room<span className="text-accent">.</span>
            </h1>
            <p className="text-graphite/60 font-sans text-base mb-8 max-w-lg">
              Upload your service menu and instantly see which professional brands fit your protocols, products, and revenue goals.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <Link
                to="/portal/signup"
                className="inline-flex items-center gap-2 px-6 py-3 bg-graphite hover:bg-graphite/90 text-white text-sm font-medium font-sans rounded-lg transition-colors"
              >
                <Upload className="w-4 h-4" />
                Upload your menu — free
              </Link>
              <Link
                to="/portal/login"
                className="inline-flex items-center gap-1.5 text-sm font-medium font-sans text-graphite/60 hover:text-graphite transition-colors"
              >
                Sign in
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Search */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-graphite/60" />
            <input
              type="text"
              placeholder="Search brands…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-accent-soft rounded-lg focus:ring-2 focus:ring-graphite/20 focus:border-graphite font-sans text-sm text-graphite placeholder:text-graphite/60 bg-white"
            />
          </div>
          {brands.length > 0 && (
            <p className="text-sm text-graphite/60 font-sans hidden sm:block">
              {filteredBrands.length} brand{filteredBrands.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-700 font-sans text-sm mb-3">{error}</p>
              <button
                onClick={() => void fetchBrands()}
                className="px-4 py-2 bg-white border border-red-200 text-red-700 text-sm font-medium font-sans rounded-lg hover:bg-red-50 transition-colors"
              >
                Try again
              </button>
            </div>
          </div>
        ) : loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[0, 1, 2, 3, 4, 5].map(i => <BrandCardSkeleton key={i} />)}
          </div>
        ) : filteredBrands.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-accent-soft">
            <p className="text-graphite/60 font-sans text-sm">
              {searchQuery ? `No brands match "${searchQuery}"` : 'No brands available yet.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-3 text-sm text-graphite font-medium font-sans hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBrands.map((brand) => {
              const stats = brandStats[brand.id] || { protocols: 0, products: 0, assets: 0 };
              const keyStat = [
                stats.protocols > 0 ? `${stats.protocols} Protocols` : null,
                stats.products > 0 ? `${stats.products} Products` : null,
              ].filter(Boolean).join(' · ') || undefined;

              return (
                <BrandCard
                  key={brand.id}
                  id={brand.id}
                  name={brand.name}
                  slug={brand.slug}
                  description={brand.description}
                  logoUrl={brand.logo_url}
                  keyStat={keyStat}
                  href={`/portal/brands/${brand.slug}`}
                />
              );
            })}
          </div>
        )}

        {/* ── WO-11: Intelligence Preview ─────────────────────────── */}
        <section className="rounded-xl border border-accent-soft bg-graphite overflow-hidden">
          <div className="px-6 py-5 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <Brain className="w-4 h-4 text-accent" />
              </div>
              <div>
                <h2 className="font-heading text-lg font-bold text-white">See what&apos;s trending in treatment rooms near you</h2>
                <p className="text-xs text-accent-soft/70 font-sans">Live intelligence signals from the Socelle platform</p>
              </div>
            </div>
          </div>
          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/10">
            {(() => {
              const growth = getGrowthOpportunity();
              return (
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-accent" />
                    <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-accent">Growth Opportunity</span>
                  </div>
                  <h3 className="font-sans font-semibold text-white text-sm mb-2">{growth.title}</h3>
                  <p className="text-xs text-accent-soft/80 font-sans leading-relaxed line-clamp-3">{growth.description}</p>
                  <div className="mt-4 flex items-center gap-3">
                    <span className="text-xs font-sans font-medium text-accent bg-accent/10 px-2.5 py-1 rounded-full">
                      {growth.peerAdoptionPct}% peer adoption
                    </span>
                    <span className="text-xs font-sans text-accent-soft/60">{growth.estimatedRevenueLift}</span>
                  </div>
                </div>
              );
            })()}
            {(() => {
              const demand = getDemandSignal();
              return (
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-accent" />
                    <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-accent">Demand Signal</span>
                  </div>
                  <h3 className="font-sans font-semibold text-white text-sm mb-2">{demand.title}</h3>
                  <p className="text-xs text-accent-soft/80 font-sans leading-relaxed line-clamp-3">{demand.description}</p>
                  <div className="mt-4 flex items-center gap-3">
                    <span className="text-xs font-sans font-medium text-accent bg-accent/10 px-2.5 py-1 rounded-full">
                      +{demand.magnitude}% this quarter
                    </span>
                    <span className="text-xs font-sans text-accent-soft/60">{demand.region}</span>
                  </div>
                </div>
              );
            })()}
          </div>
          <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
            <p className="text-xs text-accent-soft/60 font-sans">Sign up to unlock personalized intelligence for your business</p>
            <Link
              to="/portal/signup"
              className="inline-flex items-center gap-1.5 text-sm font-medium font-sans text-accent hover:text-white transition-colors"
            >
              Get started free
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

        {/* Bottom sign-up nudge */}
        {!loading && filteredBrands.length > 0 && (
          <div className="flex items-center justify-between gap-6 bg-white rounded-xl border border-accent-soft px-6 py-5">
            <div>
              <p className="text-sm font-semibold text-graphite font-sans">See which brands fit your menu</p>
              <p className="text-xs text-graphite/60 font-sans mt-0.5">Upload your service menu for an instant brand match analysis.</p>
            </div>
            <Link
              to="/portal/signup"
              className="flex-shrink-0 inline-flex items-center gap-1.5 px-5 py-2.5 bg-graphite hover:bg-graphite/90 text-white text-sm font-medium font-sans rounded-lg transition-colors"
            >
              Get started free
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
