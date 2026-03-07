// AdminShopCategories.tsx — /admin/shop/categories — Category management (LIVE — product_categories table)
import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, FolderTree } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { ProductCategory } from '../../lib/shop/types';

export default function AdminShopCategories() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ProductCategory | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', parent_id: '', sort_order: 0, is_active: true, image_url: '' });

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('product_categories').select('*').order('sort_order');
    setCategories((data as ProductCategory[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', slug: '', description: '', parent_id: '', sort_order: 0, is_active: true, image_url: '' });
    setShowForm(true);
  };

  const openEdit = (c: ProductCategory) => {
    setEditing(c);
    setForm({ name: c.name, slug: c.slug, description: c.description ?? '', parent_id: c.parent_id ?? '', sort_order: c.sort_order, is_active: c.is_active, image_url: c.image_url ?? '' });
    setShowForm(true);
  };

  const handleSave = async () => {
    const payload = {
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-'),
      description: form.description || null,
      parent_id: form.parent_id || null,
      sort_order: form.sort_order,
      is_active: form.is_active,
      image_url: form.image_url || null,
    };
    if (editing) await supabase.from('product_categories').update(payload).eq('id', editing.id);
    else await supabase.from('product_categories').insert(payload);
    setShowForm(false);
    fetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    await supabase.from('product_categories').delete().eq('id', id);
    fetch();
  };

  const parents = categories.filter(c => !c.parent_id);
  const children = (parentId: string) => categories.filter(c => c.parent_id === parentId);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-sans font-semibold text-pro-charcoal">Shop Categories</h1>
        <button onClick={openCreate} className="flex items-center gap-2 h-10 px-4 bg-pro-navy text-white text-sm font-sans font-semibold rounded-lg hover:bg-pro-navy-dark transition-colors">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-pro-charcoal/40">
          <div className="bg-white rounded-xl shadow-modal w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-sans font-semibold text-pro-charcoal">{editing ? 'Edit Category' : 'New Category'}</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-pro-warm-gray" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-pro-warm-gray uppercase block mb-1">Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full h-10 px-3 border border-pro-stone rounded-lg text-sm font-sans" />
              </div>
              <div>
                <label className="text-xs font-semibold text-pro-warm-gray uppercase block mb-1">Slug</label>
                <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="w-full h-10 px-3 border border-pro-stone rounded-lg text-sm font-sans" />
              </div>
              <div>
                <label className="text-xs font-semibold text-pro-warm-gray uppercase block mb-1">Parent Category</label>
                <select value={form.parent_id} onChange={e => setForm(f => ({ ...f, parent_id: e.target.value }))} className="w-full h-10 px-3 border border-pro-stone rounded-lg text-sm font-sans">
                  <option value="">None (top-level)</option>
                  {categories.filter(c => c.id !== editing?.id).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-pro-warm-gray uppercase block mb-1">Sort Order</label>
                <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} className="w-full h-10 px-3 border border-pro-stone rounded-lg text-sm font-sans" />
              </div>
              <div>
                <label className="text-xs font-semibold text-pro-warm-gray uppercase block mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full px-3 py-2 border border-pro-stone rounded-lg text-sm font-sans resize-none" />
              </div>
              <label className="flex items-center gap-2 text-sm font-sans text-pro-charcoal">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="rounded" /> Active
              </label>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="h-10 px-4 border border-pro-stone text-pro-warm-gray text-sm font-sans rounded-lg hover:bg-pro-cream">Cancel</button>
              <button onClick={handleSave} className="h-10 px-6 bg-pro-navy text-white text-sm font-sans font-semibold rounded-lg hover:bg-pro-navy-dark">Save</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-pro-stone p-6">
        {loading && <p className="text-center text-pro-warm-gray py-8">Loading...</p>}
        {!loading && categories.length === 0 && (
          <div className="text-center py-8 text-pro-warm-gray">
            <FolderTree className="w-8 h-8 mx-auto mb-2 opacity-30" />
            No categories yet
          </div>
        )}
        {!loading && parents.map(parent => (
          <div key={parent.id} className="mb-4">
            <div className="flex items-center justify-between py-2 px-3 bg-pro-cream rounded-lg">
              <div className="flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-pro-warm-gray" />
                <span className="text-sm font-sans font-semibold text-pro-charcoal">{parent.name}</span>
                {!parent.is_active && <span className="text-[10px] font-semibold uppercase text-red-500">Inactive</span>}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => openEdit(parent)} className="text-pro-warm-gray hover:text-pro-charcoal"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(parent.id)} className="text-pro-warm-gray hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            {children(parent.id).map(child => (
              <div key={child.id} className="flex items-center justify-between py-2 px-3 pl-10 border-b border-pro-stone/30">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-sans text-pro-charcoal">{child.name}</span>
                  {!child.is_active && <span className="text-[10px] font-semibold uppercase text-red-500">Inactive</span>}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(child)} className="text-pro-warm-gray hover:text-pro-charcoal"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(child.id)} className="text-pro-warm-gray hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
