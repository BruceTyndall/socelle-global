import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Package } from 'lucide-react';
import { Badge, EmptyState, StatCard } from '../../../components/ui';
import { supabase } from '../../../lib/supabase';

interface Product {
  id: string;
  name: string;
  sku: string | null;
  category: string | null;
  msrp_price: number | null;
  wholesale_price: number | null;
  stock_quantity: number | null;
  is_active: boolean;
  productType: 'PRO' | 'Retail';
}

export default function HubProducts() {
  const { id: brandId } = useParams<{ id: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!brandId) return;
    (async () => {
      try {
        const [proRes, retailRes] = await Promise.all([
          supabase
            .from('pro_products')
            .select('id, name, sku, category, msrp_price, wholesale_price, stock_quantity, is_active')
            .eq('brand_id', brandId)
            .order('name'),
          supabase
            .from('retail_products')
            .select('id, name, sku, category, msrp_price, wholesale_price, stock_quantity, is_active')
            .eq('brand_id', brandId)
            .order('name'),
        ]);

        const pro: Product[]    = (proRes.data ?? []).map((p: any) => ({ ...p, productType: 'PRO' as const }));
        const retail: Product[] = (retailRes.data ?? []).map((p: any) => ({ ...p, productType: 'Retail' as const }));

        setProducts([...pro, ...retail]);
      } finally {
        setLoading(false);
      }
    })();
  }, [brandId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-white rounded-xl border border-pro-stone animate-pulse" />)}
        </div>
        <div className="h-64 bg-white rounded-xl border border-pro-stone animate-pulse" />
      </div>
    );
  }

  const active     = products.filter(p => p.is_active).length;
  const outOfStock = products.filter(p => p.is_active && (p.stock_quantity ?? 1) === 0).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Products" value={products.length} />
        <StatCard label="Active"         value={active} />
        <StatCard label="Out of Stock"   value={outOfStock} />
      </div>

      <div className="bg-white rounded-xl border border-pro-stone overflow-hidden">
        {products.length === 0 ? (
          <EmptyState icon={Package} title="No products" description="Products added by this brand will appear here." />
        ) : (
          <table className="w-full text-sm font-sans">
            <thead className="border-b border-pro-stone">
              <tr>
                {['Product', 'SKU', 'Type', 'MSRP', 'Wholesale', 'Stock', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-pro-warm-gray uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-pro-stone/60">
              {products.map(p => (
                <tr key={`${p.productType}-${p.id}`} className="hover:bg-pro-ivory/50 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-pro-cream flex items-center justify-center flex-shrink-0">
                        <Package className="w-4 h-4 text-pro-warm-gray" />
                      </div>
                      <span className="font-medium text-pro-charcoal">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-xs text-pro-warm-gray">{p.sku ?? '—'}</td>
                  <td className="px-4 py-3.5">
                    <Badge variant={p.productType === 'PRO' ? 'navy' : 'gold'}>{p.productType}</Badge>
                  </td>
                  <td className="px-4 py-3.5 text-pro-charcoal">
                    {p.msrp_price != null ? `$${p.msrp_price}` : '—'}
                  </td>
                  <td className="px-4 py-3.5 text-pro-charcoal">
                    {p.wholesale_price != null ? `$${p.wholesale_price}` : '—'}
                  </td>
                  <td className="px-4 py-3.5">
                    {p.stock_quantity != null ? (
                      <span className={`font-semibold ${p.stock_quantity === 0 ? 'text-red-500' : 'text-pro-charcoal'}`}>
                        {p.stock_quantity}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge variant={p.is_active ? 'green' : 'gray'} dot>
                      {p.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
