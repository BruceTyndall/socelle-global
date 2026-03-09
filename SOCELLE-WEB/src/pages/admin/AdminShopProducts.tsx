// AdminShopProducts.tsx — /admin/shop/products — Product management (LIVE — products table)
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2, Search, Package, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Product } from '../../lib/shop/types';
import { formatCents } from '../../lib/shop/types';

export default function AdminShopProducts() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Product | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: products = [], isLoading: loading } = useQuery({
    queryKey: ['admin-products', search],
    queryFn: async () => {
      let query = supabase.from('products').select('*').order('created_at', { ascending: false });
      if (search) query = query.ilike('name', `%${search}%`);
      const { data } = await query;
      return (data as Product[]) ?? [];
    },
  });

  const [form, setForm] = useState({
    name: '', slug: '', description: '', short_description: '', price_cents: 0,
    compare_at_price_cents: 0, sku: '', stock_quantity: 0, is_active: true, is_featured: false,
    category_id: '', brand_id: '', images: '' as string,
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', slug: '', description: '', short_description: '', price_cents: 0, compare_at_price_cents: 0, sku: '', stock_quantity: 0, is_active: true, is_featured: false, category_id: '', brand_id: '', images: '' });
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    const imgs = (p.images as string[]) ?? [];
    setForm({
      name: p.name, slug: p.slug, description: p.description ?? '', short_description: p.short_description ?? '',
      price_cents: p.price_cents ?? 0, compare_at_price_cents: p.compare_at_price_cents ?? 0,
      sku: p.sku ?? '', stock_quantity: p.stock_quantity ?? 0, is_active: p.is_active ?? true, is_featured: p.is_featured ?? false,
      category_id: p.category_id ?? '', brand_id: p.brand_id ?? '', images: imgs.join('\n'),
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    const payload = {
      name: form.name, slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-'),
      description: form.description || null, short_description: form.short_description || null,
      price_cents: form.price_cents, compare_at_price_cents: form.compare_at_price_cents || null,
      sku: form.sku || null, stock_quantity: form.stock_quantity,
      is_active: form.is_active, is_featured: form.is_featured,
      category_id: form.category_id || null, brand_id: form.brand_id || null,
      images: form.images.split('\n').filter(Boolean),
    };

    if (editing) {
      await supabase.from('products').update(payload).eq('id', editing.id);
    } else {
      await supabase.from('products').insert(payload);
    }
    setShowForm(false);
    void queryClient.invalidateQueries({ queryKey: ['admin-products'] });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await supabase.from('products').delete().eq('id', id);
    void queryClient.invalidateQueries({ queryKey: ['admin-products'] });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-sans font-semibold text-graphite">Shop Products</h1>
        <button onClick={openCreate} className="flex items-center gap-2 h-10 px-4 bg-graphite text-white text-sm font-sans font-semibold rounded-lg hover:bg-graphite-dark transition-colors">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-graphite/60" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="w-full h-10 pl-10 pr-4 border border-accent-soft rounded-lg text-sm font-sans text-graphite focus:outline-none focus:ring-1 focus:ring-graphite" />
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-graphite/40">
          <div className="bg-white rounded-xl shadow-modal w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-sans font-semibold text-graphite">{editing ? 'Edit Product' : 'New Product'}</h2>
              <button onClick={() => setShowForm(false)} className="text-graphite/60 hover:text-graphite"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs font-semibold text-graphite/60 uppercase block mb-1">Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full h-10 px-3 border border-accent-soft rounded-lg text-sm font-sans" />
              </div>
              <div>
                <label className="text-xs font-semibold text-graphite/60 uppercase block mb-1">Slug</label>
                <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="auto-generated" className="w-full h-10 px-3 border border-accent-soft rounded-lg text-sm font-sans" />
              </div>
              <div>
                <label className="text-xs font-semibold text-graphite/60 uppercase block mb-1">SKU</label>
                <input value={form.sku} onChange={e => setForm(f => ({ ...f, sku: e.target.value }))} className="w-full h-10 px-3 border border-accent-soft rounded-lg text-sm font-sans" />
              </div>
              <div>
                <label className="text-xs font-semibold text-graphite/60 uppercase block mb-1">Price (cents)</label>
                <input type="number" value={form.price_cents} onChange={e => setForm(f => ({ ...f, price_cents: parseInt(e.target.value) || 0 }))} className="w-full h-10 px-3 border border-accent-soft rounded-lg text-sm font-sans" />
              </div>
              <div>
                <label className="text-xs font-semibold text-graphite/60 uppercase block mb-1">Compare-at Price (cents)</label>
                <input type="number" value={form.compare_at_price_cents} onChange={e => setForm(f => ({ ...f, compare_at_price_cents: parseInt(e.target.value) || 0 }))} className="w-full h-10 px-3 border border-accent-soft rounded-lg text-sm font-sans" />
              </div>
              <div>
                <label className="text-xs font-semibold text-graphite/60 uppercase block mb-1">Stock Quantity</label>
                <input type="number" value={form.stock_quantity} onChange={e => setForm(f => ({ ...f, stock_quantity: parseInt(e.target.value) || 0 }))} className="w-full h-10 px-3 border border-accent-soft rounded-lg text-sm font-sans" />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm font-sans text-graphite">
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="rounded" /> Active
                </label>
                <label className="flex items-center gap-2 text-sm font-sans text-graphite">
                  <input type="checkbox" checked={form.is_featured} onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))} className="rounded" /> Featured
                </label>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-semibold text-graphite/60 uppercase block mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} className="w-full px-3 py-2 border border-accent-soft rounded-lg text-sm font-sans resize-none" />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-semibold text-graphite/60 uppercase block mb-1">Image URLs (one per line)</label>
                <textarea value={form.images} onChange={e => setForm(f => ({ ...f, images: e.target.value }))} rows={3} className="w-full px-3 py-2 border border-accent-soft rounded-lg text-sm font-sans font-mono resize-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-graphite/60 uppercase block mb-1">Category ID</label>
                <input value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} className="w-full h-10 px-3 border border-accent-soft rounded-lg text-sm font-sans" />
              </div>
              <div>
                <label className="text-xs font-semibold text-graphite/60 uppercase block mb-1">Brand ID</label>
                <input value={form.brand_id} onChange={e => setForm(f => ({ ...f, brand_id: e.target.value }))} className="w-full h-10 px-3 border border-accent-soft rounded-lg text-sm font-sans" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="h-10 px-4 border border-accent-soft text-graphite/60 text-sm font-sans rounded-lg hover:bg-accent-soft transition-colors">Cancel</button>
              <button onClick={handleSave} className="h-10 px-6 bg-graphite text-white text-sm font-sans font-semibold rounded-lg hover:bg-graphite-dark transition-colors">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-accent-soft overflow-hidden">
        <table className="w-full text-sm font-sans">
          <thead className="bg-accent-soft border-b border-accent-soft">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-graphite/60 text-xs uppercase">Product</th>
              <th className="text-left px-4 py-3 font-semibold text-graphite/60 text-xs uppercase">SKU</th>
              <th className="text-left px-4 py-3 font-semibold text-graphite/60 text-xs uppercase">Price</th>
              <th className="text-left px-4 py-3 font-semibold text-graphite/60 text-xs uppercase">Stock</th>
              <th className="text-left px-4 py-3 font-semibold text-graphite/60 text-xs uppercase">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-graphite/60">Loading...</td></tr>
            )}
            {!loading && products.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-graphite/60">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No products yet
              </td></tr>
            )}
            {products.map(p => {
              const imgs = (p.images as string[]) ?? [];
              return (
                <tr key={p.id} className="border-b border-accent-soft/50 hover:bg-accent-soft/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-accent-soft overflow-hidden flex-shrink-0">
                        {imgs[0] && <img src={imgs[0]} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <span className="font-semibold text-graphite truncate max-w-[200px]">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-graphite/60 font-mono text-xs">{p.sku ?? '-'}</td>
                  <td className="px-4 py-3 text-graphite font-semibold">{formatCents(p.price_cents)}</td>
                  <td className="px-4 py-3 text-graphite">{p.stock_quantity}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${p.is_active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                      {p.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(p)} className="text-graphite/60 hover:text-graphite"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(p.id)} className="text-graphite/60 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
