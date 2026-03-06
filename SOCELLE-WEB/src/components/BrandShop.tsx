import { useState, useEffect, useMemo } from 'react';
import { Search, LogIn, ShoppingCart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { createScopedLogger } from '../lib/logger';
import type { BrandTheme } from '../lib/types';

const log = createScopedLogger('BrandShop');

interface Product {
  id: string;
  product_name: string;
  category: string | null;
  retail_price?: number | null;
  unit_cost?: number | null;
  size?: string | null;
  type: 'pro' | 'retail';
}

interface BrandShopProps {
  brandId: string;
  brandName: string;
  brandTheme?: BrandTheme;
  userRole: string;
  onAddToCart: (item: {
    productId: string;
    productName: string;
    productType: 'pro' | 'retail';
    unitPrice: number;
    sku?: string;
  }) => void;
}

export default function BrandShop({
  brandId,
  // brandName is currently unused but kept in props for compatibility
  brandTheme,
  userRole,
  onAddToCart,
}: BrandShopProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'retail' | 'pro'>('retail');

  const canViewPro = ['business_user', 'admin', 'platform_admin'].includes(userRole);
  const accentColor = brandTheme?.colors?.accent || '#3b82f6';

  useEffect(() => {
    loadProducts();
  }, [brandId, userRole]);

  async function loadProducts() {
    setLoading(true);
    try {
      const retailPromise = supabase
        .from('retail_products')
        .select('id, product_name, category, retail_price, size')
        .eq('brand_id', brandId);

      const proPromise = canViewPro
        ? supabase
            .from('pro_products')
            .select('id, product_name, category, unit_cost, size')
            .eq('brand_id', brandId)
        : null;

      const [retailRes, proRes] = await Promise.all([
        retailPromise,
        proPromise ?? Promise.resolve({ data: [] }),
      ]);

      const retailData = (retailRes as any).data || [];
      const proData = canViewPro && proRes ? (proRes as any).data || [] : [];

      const allProducts: Product[] = [
        ...retailData.map((p: any) => ({ ...p, type: 'retail' as const })),
        ...proData.map((p: any) => ({ ...p, type: 'pro' as const })),
      ];

      setProducts(allProducts);
    } catch (error) {
      log.error('Error loading products', { error: error instanceof Error ? error.message : String(error) });
    } finally {
      setLoading(false);
    }
  }

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) {
      if (p.category) set.add(p.category);
    }
    return ['all', ...Array.from(set)];
  }, [products]);

  const filteredProducts = useMemo(
    () => products.filter(p => {
      const matchesSearch = p.product_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesTab = p.type === activeTab;
      return matchesSearch && matchesCategory && matchesTab;
    }),
    [products, searchTerm, selectedCategory, activeTab]
  );

  const handleAddToCart = (product: Product) => {
    const price = product.type === 'retail' ? product.retail_price : product.unit_cost;
    if (price == null || price < 0) return;

    onAddToCart({
      productId: product.id,
      productName: product.product_name,
      productType: product.type,
      unitPrice: price,
      sku: product.size || undefined,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-pro-warm-gray">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="sticky top-0 z-10 bg-white border-b border-pro-stone pb-4">
        {canViewPro && (
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setActiveTab('retail')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'retail'
                  ? 'text-white'
                  : 'bg-pro-stone text-pro-charcoal hover:bg-pro-stone'
              }`}
              style={activeTab === 'retail' ? { backgroundColor: accentColor } : {}}
            >
              Retail
            </button>
            <button
              onClick={() => setActiveTab('pro')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'pro'
                  ? 'text-white'
                  : 'bg-pro-stone text-pro-charcoal hover:bg-pro-stone'
              }`}
              style={activeTab === 'pro' ? { backgroundColor: accentColor } : {}}
            >
              Professional
            </button>
          </div>
        )}

        {!canViewPro && activeTab === 'pro' && (
          <div className="bg-pro-cream border border-pro-stone rounded-lg p-4 mb-4 flex items-center gap-3">
            <LogIn className="w-5 h-5 text-pro-navy" />
            <p className="text-pro-charcoal">
              Log in to view and order professional products
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-pro-warm-gray" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-pro-stone rounded-lg focus:ring-2 focus:ring-pro-navy focus:border-pro-navy"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'text-white'
                  : 'bg-pro-stone text-pro-charcoal hover:bg-pro-stone'
              }`}
              style={selectedCategory === cat ? { backgroundColor: accentColor } : {}}
            >
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12 text-pro-warm-gray">
          No products found
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const price = product.type === 'retail' ? product.retail_price : product.unit_cost;
            const initial = product.product_name.charAt(0).toUpperCase();

            return (
              <div
                key={product.id}
                className="bg-white rounded-lg border border-pro-stone overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div
                  className="h-32 flex items-center justify-center text-white text-3xl font-bold"
                  style={{ backgroundColor: accentColor }}
                >
                  {initial}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-pro-charcoal mb-1 line-clamp-2">
                    {product.product_name}
                  </h3>
                  {product.category && (
                    <span className="inline-block px-2 py-0.5 bg-pro-stone text-pro-warm-gray text-xs rounded mb-2">
                      {product.category}
                    </span>
                  )}
                  <div className="mt-2 mb-3">
                    {price != null ? (
                      <p className="text-lg font-bold text-pro-charcoal">
                        ${price.toFixed(2)}
                      </p>
                    ) : (
                      <p className="text-sm text-pro-warm-gray">Contact for pricing</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={price == null}
                    className="w-full py-2 px-4 rounded-lg font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{ backgroundColor: accentColor }}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
