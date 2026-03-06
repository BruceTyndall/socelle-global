import { useEffect, useState } from 'react';
import { Store, Edit2, Eye, Globe, Star, Package, Users, AlertCircle, RefreshCw, Check } from 'lucide-react';
import { Button, Badge } from '../../components/ui';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

interface BrandData {
  id: string;
  name: string;
  description: string | null;
  long_description: string | null;
  short_description: string | null;
  category_tags: string[];
  logo_url: string | null;
  website_url: string | null;
}

interface FeaturedProduct {
  id: string;
  name: string;
  type: 'PRO' | 'Retail';
  msrp: number | null;
  bestseller: boolean;
}

interface StorefrontStats {
  productCount: number;
  retailerCount: number;
}

export default function BrandStorefront() {
  const { brandId } = useAuth();
  const [brand, setBrand] = useState<BrandData | null>(null);
  const [products, setProducts] = useState<FeaturedProduct[]>([]);
  const [stats, setStats] = useState<StorefrontStats>({ productCount: 0, retailerCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (brandId) fetchData();
    else setLoading(false);
  }, [brandId]);

  const fetchData = async () => {
    if (!brandId) return;
    try {
      setLoading(true);
      setError(null);

      const [brandRes, proRes, retailRes, plansRes] = await Promise.all([
        supabase
          .from('brands')
          .select('id, name, description, long_description, short_description, category_tags, logo_url, website_url')
          .eq('id', brandId)
          .single(),
        supabase
          .from('pro_products')
          .select('id, product_name, msrp_price, is_bestseller')
          .eq('brand_id', brandId)
          .eq('is_active', true)
          .order('is_bestseller', { ascending: false })
          .limit(4),
        supabase
          .from('retail_products')
          .select('id, product_name, msrp_price, is_bestseller')
          .eq('brand_id', brandId)
          .eq('is_active', true)
          .order('is_bestseller', { ascending: false })
          .limit(4),
        supabase
          .from('plans')
          .select('business_id')
          .eq('brand_id', brandId),
      ]);

      if (brandRes.error) throw brandRes.error;

      const brandData = brandRes.data;
      setBrand(brandData);
      setDescription(brandData.long_description || brandData.description || '');

      const proProducts: FeaturedProduct[] = (proRes.data || []).map(p => ({
        id: p.id,
        name: p.product_name,
        type: 'PRO' as const,
        msrp: p.msrp_price ?? null,
        bestseller: p.is_bestseller ?? false,
      }));
      const retailProducts: FeaturedProduct[] = (retailRes.data || []).map(p => ({
        id: p.id,
        name: p.product_name,
        type: 'Retail' as const,
        msrp: p.msrp_price ?? null,
        bestseller: p.is_bestseller ?? false,
      }));
      const allProducts = [...proProducts, ...retailProducts]
        .sort((a, b) => (b.bestseller ? 1 : 0) - (a.bestseller ? 1 : 0))
        .slice(0, 4);
      setProducts(allProducts);

      const uniqueRetailers = new Set((plansRes.data || []).map(p => p.business_id)).size;
      setStats({
        productCount: (proRes.data?.length || 0) + (retailRes.data?.length || 0),
        retailerCount: uniqueRetailers,
      });
    } catch (err: any) {
      console.warn('Storefront fetch error:', err);
      setError('Unable to load storefront data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!brandId) return;
    setSaving(true);
    try {
      const { error: updateErr } = await supabase
        .from('brands')
        .update({ long_description: description })
        .eq('id', brandId);
      if (updateErr) throw updateErr;
      setBrand(prev => prev ? { ...prev, long_description: description } : prev);
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleEdit = () => {
    if (editing) {
      handleSave();
    } else {
      setEditing(true);
    }
  };

  if (!brandId) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-pro-warm-gray font-sans">No brand associated with your account.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-pro-stone/30 rounded w-40" />
          <div className="h-9 bg-pro-stone/30 rounded w-32" />
        </div>
        <div className="bg-white rounded-xl border border-pro-stone overflow-hidden">
          <div className="h-48 bg-pro-stone/20" />
          <div className="p-6 space-y-4">
            <div className="h-4 bg-pro-stone/30 rounded w-3/4" />
            <div className="h-4 bg-pro-stone/30 rounded w-1/2" />
            <div className="h-4 bg-pro-stone/30 rounded w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-serif text-2xl text-pro-navy">Storefront</h1>
          <p className="text-sm text-pro-warm-gray font-sans mt-0.5">Your public brand page seen by retailers</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 font-sans text-sm flex-1">{error}</p>
          <button onClick={fetchData} className="flex items-center gap-1.5 text-red-600 text-sm font-medium hover:text-red-800">
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-pro-navy">Storefront</h1>
          <p className="text-sm text-pro-warm-gray font-sans mt-0.5">Your public brand page seen by retailers</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-sans">
              <Check className="w-3.5 h-3.5" />
              Saved
            </span>
          )}
          <Button variant="outline" size="sm" iconLeft={<Eye className="w-4 h-4" />}>Preview</Button>
          <Button
            size="sm"
            iconLeft={editing ? <Check className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
            onClick={handleToggleEdit}
            disabled={saving}
          >
            {editing ? (saving ? 'Saving…' : 'Save Changes') : 'Edit Storefront'}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-pro-stone overflow-hidden">
        {/* Hero banner */}
        <div className="h-48 bg-gradient-to-r from-pro-navy via-pro-charcoal to-pro-navy flex items-end p-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="absolute w-32 h-32 border border-white rounded-full"
                style={{ top: `${i * 30 - 40}%`, left: `${i * 20}%`, opacity: 0.5 }} />
            ))}
          </div>
          <div className="relative">
            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mb-3 shadow-lg">
              {brand?.logo_url
                ? <img src={brand.logo_url} alt={brand?.name} className="w-12 h-12 object-contain" />
                : <Store className="w-8 h-8 text-pro-navy" />
              }
            </div>
            <h2 className="font-serif text-3xl text-white">{brand?.name}</h2>
            {brand?.short_description && (
              <p className="text-pro-gold font-sans text-sm mt-1">{brand.short_description}</p>
            )}
          </div>
          {editing && (
            <button className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-white/20 text-white rounded-lg text-xs font-sans backdrop-blur-sm hover:bg-white/30 transition-colors">
              <Edit2 className="w-3 h-3" /> Edit Banner
            </button>
          )}
        </div>

        {/* Stats bar */}
        <div className="flex items-center divide-x divide-pro-stone border-b border-pro-stone">
          {[
            { icon: Package, label: `${stats.productCount} Products`, sub: 'PRO + Retail' },
            { icon: Users, label: `${stats.retailerCount} Retailers`, sub: 'Active partners' },
            { icon: Globe, label: 'Website', sub: brand?.website_url ? brand.website_url.replace(/^https?:\/\//, '') : 'Not set' },
          ].map((stat) => (
            <div key={stat.label} className="flex-1 flex items-center gap-3 px-5 py-4">
              <stat.icon className="w-5 h-5 text-pro-warm-gray flex-shrink-0" />
              <div className="min-w-0">
                <p className="font-semibold text-pro-charcoal font-sans text-sm">{stat.label}</p>
                <p className="text-xs text-pro-warm-gray font-sans truncate">{stat.sub}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-pro-stone">
          {/* About */}
          <div className="lg:col-span-2 p-6 space-y-5">
            <div>
              <h3 className="font-sans font-semibold text-pro-charcoal mb-2">About</h3>
              {editing ? (
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Describe your brand for retailers…"
                  className="w-full px-4 py-3 rounded-lg border border-pro-stone text-sm font-sans text-pro-charcoal focus:outline-none focus:ring-2 focus:ring-pro-navy/20 resize-none"
                />
              ) : (
                <p className="text-sm text-pro-warm-gray font-sans leading-relaxed">
                  {description || 'No description yet. Click Edit Storefront to add one.'}
                </p>
              )}
            </div>

            {products.length > 0 && (
              <div>
                <h3 className="font-sans font-semibold text-pro-charcoal mb-2">Featured Products</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {products.map(p => (
                    <div key={p.id} className="rounded-lg border border-pro-stone p-3 hover:border-pro-navy/30 transition-colors">
                      <div className="aspect-square rounded-lg bg-pro-cream mb-2 flex items-center justify-center">
                        <Package className="w-6 h-6 text-pro-stone" />
                      </div>
                      <p className="font-medium text-pro-charcoal text-xs font-sans leading-snug mb-1">{p.name}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant={p.type === 'PRO' ? 'navy' : 'gold'}>{p.type}</Badge>
                        {p.msrp != null && (
                          <span className="text-xs text-pro-warm-gray font-sans">${p.msrp}</span>
                        )}
                      </div>
                      {p.bestseller && (
                        <div className="mt-1.5">
                          <Badge variant="gold"><Star className="w-2.5 h-2.5 inline mr-0.5" />Best</Badge>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(brand?.category_tags?.length ?? 0) > 0 && (
              <div>
                <h3 className="font-sans font-semibold text-pro-charcoal mb-2">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {brand!.category_tags.map(c => (
                    <Badge key={c} variant="default">{c}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="p-6 space-y-5">
            <div>
              <h3 className="font-sans font-semibold text-pro-charcoal mb-3">Brand details</h3>
              <div className="space-y-2 text-sm font-sans">
                <div className="flex justify-between">
                  <span className="text-pro-warm-gray">Products</span>
                  <span className="font-medium text-pro-charcoal">{stats.productCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-pro-warm-gray">Retailers</span>
                  <span className="font-medium text-pro-charcoal">{stats.retailerCount}</span>
                </div>
                {brand?.website_url && (
                  <div className="flex justify-between gap-2">
                    <span className="text-pro-warm-gray flex-shrink-0">Website</span>
                    <a
                      href={brand.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pro-navy hover:underline truncate text-right text-xs"
                    >
                      {brand.website_url.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-pro-stone">
              <Button className="w-full" size="sm">Request to Carry</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
