// AdminShopHub.tsx — /admin/shop — Shop management hub
// Data: LIVE — products, product_categories, orders, discount_codes, reviews tables
import { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  ShoppingBag, Package, Tag, Layers, Star, BarChart3,
  Search, RefreshCw, Eye, Edit2, Check, X as XIcon,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useProducts } from '../../lib/shop/useProducts';
import { useCategories } from '../../lib/shop/useCategories';
import { formatCents } from '../../lib/shop/types';
import type { Product, ProductFilters } from '../../lib/shop/types';

type Tab = 'products' | 'categories' | 'orders' | 'inventory' | 'discounts' | 'reviews';

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'products', label: 'Products', icon: Package },
  { key: 'categories', label: 'Categories', icon: Layers },
  { key: 'orders', label: 'Orders', icon: ShoppingBag },
  { key: 'inventory', label: 'Inventory', icon: BarChart3 },
  { key: 'discounts', label: 'Discounts', icon: Tag },
  { key: 'reviews', label: 'Reviews', icon: Star },
];

// ── Admin-scoped hooks (no user filter — admin sees all) ──
function useAdminOrders() {
  const [orders, setOrders] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    setOrders((data as Array<Record<string, unknown>>) ?? []);
    setLoading(false);
  }, []);

  useState(() => { fetch(); });
  return { orders, loading, refetch: fetch };
}

function useAdminDiscounts() {
  const [discounts, setDiscounts] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('discount_codes')
      .select('*')
      .order('created_at', { ascending: false });
    setDiscounts((data as Array<Record<string, unknown>>) ?? []);
    setLoading(false);
  }, []);

  useState(() => { fetch(); });
  return { discounts, loading, refetch: fetch };
}

function useAdminReviews() {
  const [reviews, setReviews] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    setReviews((data as Array<Record<string, unknown>>) ?? []);
    setLoading(false);
  }, []);

  useState(() => { fetch(); });
  return { reviews, loading, refetch: fetch };
}

export default function AdminShopHub() {
  const [activeTab, setActiveTab] = useState<Tab>('products');
  const [search, setSearch] = useState('');

  const productFilters: ProductFilters = { search: search || undefined, per_page: 50 };
  const { products, loading: productsLoading, total: productsTotal, refetch: refetchProducts } = useProducts(productFilters);
  const { categories, loading: catsLoading } = useCategories();
  const { orders: adminOrders, loading: ordersLoading, refetch: refetchOrders } = useAdminOrders();
  const { discounts, loading: discountsLoading, refetch: refetchDiscounts } = useAdminDiscounts();
  const { reviews: adminReviews, loading: reviewsLoading, refetch: refetchReviews } = useAdminReviews();

  // Inventory = products view with stock focus
  const lowStockProducts = products.filter(p => (p.stock_quantity ?? 0) < 10);

  const handleApproveReview = async (reviewId: string) => {
    await supabase.from('reviews').update({ is_approved: true }).eq('id', reviewId);
    refetchReviews();
  };

  const handleRejectReview = async (reviewId: string) => {
    await supabase.from('reviews').delete().eq('id', reviewId);
    refetchReviews();
  };

  const handleToggleProduct = async (productId: string, isActive: boolean) => {
    await supabase.from('products').update({ is_active: !isActive }).eq('id', productId);
    refetchProducts();
  };

  return (
    <>
      <Helmet>
        <title>Shop Management | Admin | SOCELLE</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-sans font-semibold text-pro-charcoal">Shop Management</h1>
            <p className="text-sm font-sans text-pro-warm-gray mt-1">
              Products, categories, orders, inventory, discounts, and reviews.
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Products', value: productsTotal, icon: Package },
            { label: 'Categories', value: categories.length, icon: Layers },
            { label: 'Orders', value: adminOrders.length, icon: ShoppingBag },
            { label: 'Low Stock', value: lowStockProducts.length, icon: BarChart3 },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl p-4 border border-pro-border">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-pro-cream rounded-lg flex items-center justify-center">
                  <s.icon className="w-4 h-4 text-pro-navy" />
                </div>
                <div>
                  <p className="text-xs font-sans text-pro-warm-gray">{s.label}</p>
                  <p className="text-lg font-sans font-semibold text-pro-charcoal">{s.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-pro-cream/50 rounded-lg p-1 overflow-x-auto">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-sans font-medium transition-colors whitespace-nowrap ${activeTab === t.key ? 'bg-white text-pro-charcoal shadow-sm' : 'text-pro-warm-gray hover:text-pro-charcoal'}`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Search */}
        {(activeTab === 'products' || activeTab === 'inventory') && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pro-warm-gray" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-pro-border rounded-lg text-sm font-sans text-pro-charcoal placeholder:text-pro-warm-gray/60 focus:outline-none focus:ring-2 focus:ring-pro-navy/20"
            />
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-xl border border-pro-border overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-pro-border">
              <p className="text-sm font-sans font-semibold text-pro-charcoal">{productsTotal} Products</p>
              <button
                onClick={() => refetchProducts()}
                className="flex items-center gap-1.5 text-xs font-sans text-pro-warm-gray hover:text-pro-charcoal transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>
            {productsLoading ? (
              <div className="p-6 text-center text-sm font-sans text-pro-warm-gray">Loading...</div>
            ) : (
              <div className="divide-y divide-pro-border">
                {products.map((p: Product) => {
                  const images = (p.images as string[]) ?? [];
                  return (
                    <div key={p.id} className="flex items-center gap-4 px-5 py-3 hover:bg-pro-cream/30 transition-colors">
                      <div className="w-12 h-12 bg-pro-cream rounded-lg overflow-hidden flex-shrink-0">
                        {images[0] && <img src={images[0]} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-sans font-semibold text-pro-charcoal truncate">{p.name}</p>
                        <p className="text-xs font-sans text-pro-warm-gray">{formatCents(p.price_cents)} | Stock: {p.stock_quantity ?? 0}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full ${p.is_active ? 'bg-signal-up/10 text-signal-up' : 'bg-signal-down/10 text-signal-down'}`}>
                          {p.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <button
                          onClick={() => handleToggleProduct(p.id, p.is_active)}
                          className="p-1.5 text-pro-warm-gray hover:text-pro-charcoal transition-colors"
                          title={p.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {p.is_active ? <Eye className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="bg-white rounded-xl border border-pro-border overflow-hidden">
            <div className="px-5 py-3 border-b border-pro-border">
              <p className="text-sm font-sans font-semibold text-pro-charcoal">{categories.length} Categories</p>
            </div>
            {catsLoading ? (
              <div className="p-6 text-center text-sm font-sans text-pro-warm-gray">Loading...</div>
            ) : categories.length === 0 ? (
              <div className="p-8 text-center">
                <Layers className="w-10 h-10 text-pro-warm-gray/30 mx-auto mb-3" />
                <p className="text-sm font-sans text-pro-warm-gray">No categories yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-pro-border">
                {categories.map(cat => (
                  <div key={cat.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-sans font-semibold text-pro-charcoal">{cat.name}</p>
                      <p className="text-xs font-sans text-pro-warm-gray">/{cat.slug}</p>
                    </div>
                    <span className={`text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full ${cat.is_active ? 'bg-signal-up/10 text-signal-up' : 'bg-signal-down/10 text-signal-down'}`}>
                      {cat.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-xl border border-pro-border overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-pro-border">
              <p className="text-sm font-sans font-semibold text-pro-charcoal">{adminOrders.length} Orders</p>
              <button onClick={refetchOrders} className="flex items-center gap-1.5 text-xs font-sans text-pro-warm-gray hover:text-pro-charcoal transition-colors">
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>
            {ordersLoading ? (
              <div className="p-6 text-center text-sm font-sans text-pro-warm-gray">Loading...</div>
            ) : adminOrders.length === 0 ? (
              <div className="p-8 text-center">
                <ShoppingBag className="w-10 h-10 text-pro-warm-gray/30 mx-auto mb-3" />
                <p className="text-sm font-sans text-pro-warm-gray">No orders yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-pro-border">
                {adminOrders.map(o => (
                  <div key={String(o.id)} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-sans font-semibold text-pro-charcoal font-mono">#{String(o.id).slice(0, 8)}</p>
                      <p className="text-xs font-sans text-pro-warm-gray">
                        {o.created_at ? new Date(String(o.created_at)).toLocaleDateString() : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-sans font-semibold text-pro-charcoal">
                        {typeof o.total_cents === 'number' ? formatCents(o.total_cents) : '$0.00'}
                      </span>
                      <span className="text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full bg-accent/10 text-accent uppercase">
                        {String(o.status ?? 'unknown')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
            {lowStockProducts.length > 0 && (
              <div className="bg-signal-warn/5 border border-signal-warn/20 rounded-xl p-4">
                <p className="text-sm font-sans font-semibold text-signal-warn mb-2">Low Stock Alert ({lowStockProducts.length} products)</p>
                <div className="space-y-2">
                  {lowStockProducts.map(p => (
                    <div key={p.id} className="flex items-center justify-between text-sm font-sans">
                      <span className="text-pro-charcoal">{p.name}</span>
                      <span className="font-semibold text-signal-warn">{p.stock_quantity ?? 0} units</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="bg-white rounded-xl border border-pro-border overflow-hidden">
              <div className="px-5 py-3 border-b border-pro-border">
                <p className="text-sm font-sans font-semibold text-pro-charcoal">Inventory Overview</p>
              </div>
              {productsLoading ? (
                <div className="p-6 text-center text-sm font-sans text-pro-warm-gray">Loading...</div>
              ) : (
                <div className="divide-y divide-pro-border">
                  {products.map(p => (
                    <div key={p.id} className="flex items-center justify-between px-5 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-sans text-pro-charcoal truncate">{p.name}</p>
                        <p className="text-xs font-sans text-pro-warm-gray">{p.sku || 'No SKU'}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`text-sm font-sans font-semibold ${(p.stock_quantity ?? 0) < 10 ? 'text-signal-warn' : 'text-signal-up'}`}>
                          {p.stock_quantity ?? 0}
                        </div>
                        <span className="text-xs font-sans text-pro-warm-gray">units</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Discounts Tab */}
        {activeTab === 'discounts' && (
          <div className="bg-white rounded-xl border border-pro-border overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-pro-border">
              <p className="text-sm font-sans font-semibold text-pro-charcoal">Discount Codes</p>
              <button onClick={refetchDiscounts} className="flex items-center gap-1.5 text-xs font-sans text-pro-warm-gray hover:text-pro-charcoal transition-colors">
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>
            {discountsLoading ? (
              <div className="p-6 text-center text-sm font-sans text-pro-warm-gray">Loading...</div>
            ) : discounts.length === 0 ? (
              <div className="p-8 text-center">
                <Tag className="w-10 h-10 text-pro-warm-gray/30 mx-auto mb-3" />
                <p className="text-sm font-sans text-pro-warm-gray">No discount codes yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-pro-border">
                {discounts.map(d => (
                  <div key={String(d.id)} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-sans font-semibold text-pro-charcoal font-mono">{String(d.code)}</p>
                      <p className="text-xs font-sans text-pro-warm-gray">
                        {d.discount_type === 'percentage' ? `${d.discount_value}% off` : `${typeof d.discount_value === 'number' ? formatCents(d.discount_value) : '$0'} off`}
                        {d.max_uses ? ` | Max uses: ${d.max_uses}` : ''}
                      </p>
                    </div>
                    <span className={`text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full ${d.is_active ? 'bg-signal-up/10 text-signal-up' : 'bg-signal-down/10 text-signal-down'}`}>
                      {d.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="bg-white rounded-xl border border-pro-border overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-pro-border">
              <p className="text-sm font-sans font-semibold text-pro-charcoal">Reviews Moderation</p>
              <button onClick={refetchReviews} className="flex items-center gap-1.5 text-xs font-sans text-pro-warm-gray hover:text-pro-charcoal transition-colors">
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>
            {reviewsLoading ? (
              <div className="p-6 text-center text-sm font-sans text-pro-warm-gray">Loading...</div>
            ) : adminReviews.length === 0 ? (
              <div className="p-8 text-center">
                <Star className="w-10 h-10 text-pro-warm-gray/30 mx-auto mb-3" />
                <p className="text-sm font-sans text-pro-warm-gray">No reviews to moderate.</p>
              </div>
            ) : (
              <div className="divide-y divide-pro-border">
                {adminReviews.map(r => (
                  <div key={String(r.id)} className="px-5 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < (typeof r.rating === 'number' ? r.rating : 0) ? 'text-signal-warn fill-signal-warn' : 'text-pro-warm-gray/20'}`} />
                          ))}
                        </div>
                        <span className={`text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full ${r.is_approved ? 'bg-signal-up/10 text-signal-up' : 'bg-signal-warn/10 text-signal-warn'}`}>
                          {r.is_approved ? 'Approved' : 'Pending'}
                        </span>
                      </div>
                      {!r.is_approved && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleApproveReview(String(r.id))}
                            className="w-7 h-7 rounded-md bg-signal-up/10 text-signal-up flex items-center justify-center hover:bg-signal-up/20 transition-colors"
                            title="Approve"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleRejectReview(String(r.id))}
                            className="w-7 h-7 rounded-md bg-signal-down/10 text-signal-down flex items-center justify-center hover:bg-signal-down/20 transition-colors"
                            title="Reject"
                          >
                            <XIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                    {Boolean(r.title) && <p className="text-sm font-sans font-semibold text-pro-charcoal">{String(r.title)}</p>}
                    {Boolean(r.body) && <p className="text-sm font-sans text-pro-warm-gray mt-1">{String(r.body)}</p>}
                    <p className="text-xs font-sans text-pro-warm-gray/60 mt-2">
                      {r.created_at ? new Date(String(r.created_at)).toLocaleDateString() : ''}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
