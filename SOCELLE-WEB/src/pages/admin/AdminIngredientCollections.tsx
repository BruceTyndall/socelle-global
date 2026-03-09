import { useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  AlertCircle,
  Layers,
  Star,
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import ErrorState from '../../components/ErrorState';

// ── WO-OVERHAUL-12: Admin Ingredient Collections ────────────────────────────

interface Collection {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  collection_type: string | null;
  is_featured: boolean;
  created_at: string;
  item_count: number;
}

interface CollectionForm {
  name: string;
  description: string;
  slug: string;
  collection_type: string;
  is_featured: boolean;
}

const EMPTY_FORM: CollectionForm = {
  name: '',
  description: '',
  slug: '',
  collection_type: '',
  is_featured: false,
};

const COLLECTION_TYPES = [
  'actives', 'humectants', 'occlusives', 'emollients',
  'preservatives', 'exfoliants', 'antioxidants',
];

export default function AdminIngredientCollections() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<CollectionForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const { data: collections = [], isLoading: loading, error: queryError } = useQuery({
    queryKey: ['admin-ingredient-collections'],
    queryFn: async () => {
      const { data, error: err } = await supabase
        .from('ingredient_collections')
        .select('id, name, description, slug, collection_type, is_featured, created_at')
        .order('name');

      if (err) throw err;

      // Get item counts
      const ids = (data ?? []).map((c: { id: string }) => c.id);
      const counts: Record<string, number> = {};
      if (ids.length > 0) {
        const { data: items } = await supabase
          .from('ingredient_collection_items')
          .select('collection_id')
          .in('collection_id', ids);
        (items ?? []).forEach((item: { collection_id: string }) => {
          counts[item.collection_id] = (counts[item.collection_id] || 0) + 1;
        });
      }

      return (data ?? []).map((c: Record<string, unknown>) => ({ ...c, item_count: counts[c.id as string] || 0 })) as Collection[];
    },
  });

  const isLive = !queryError && collections.length >= 0;
  const error = queryError ? (queryError as Error).message : null;

  const openCreate = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (col: Collection) => {
    setEditId(col.id);
    setForm({
      name: col.name,
      description: col.description ?? '',
      slug: col.slug,
      collection_type: col.collection_type ?? '',
      is_featured: col.is_featured,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || null,
        slug: form.slug.trim(),
        collection_type: form.collection_type || null,
        is_featured: form.is_featured,
      };

      if (editId) {
        const { error: err } = await supabase.from('ingredient_collections').update(payload).eq('id', editId);
        if (err) throw err;
      } else {
        const { error: err } = await supabase.from('ingredient_collections').insert(payload);
        if (err) throw err;
      }

      setShowForm(false);
      setEditId(null);
      queryClient.invalidateQueries({ queryKey: ['admin-ingredient-collections'] });
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this collection? Items will be removed.')) return;
    const { error: err } = await supabase.from('ingredient_collections').delete().eq('id', id);
    if (err) alert(err.message);
    else queryClient.invalidateQueries({ queryKey: ['admin-ingredient-collections'] });
  };

  const toggleFeatured = async (id: string, current: boolean) => {
    const { error: err } = await supabase.from('ingredient_collections').update({ is_featured: !current }).eq('id', id);
    if (err) alert(err.message);
    else queryClient.invalidateQueries({ queryKey: ['admin-ingredient-collections'] });
  };

  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-sans font-semibold text-graphite">Ingredient Collections</h1>
          <p className="text-graphite/60 font-sans text-sm mt-0.5">
            {collections.length} collections
            {isLive ? (
              <span className="ml-2 text-[10px] font-semibold bg-signal-up/10 text-signal-up px-2 py-0.5 rounded-pill">LIVE</span>
            ) : (
              <span className="ml-2 text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-pill">DEMO</span>
            )}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-graphite text-white text-sm font-sans font-medium rounded-lg hover:bg-graphite-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Collection
        </button>
      </div>

      <div className="bg-white rounded-xl border border-accent-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-sans">
            <thead>
              <tr className="bg-accent-soft/50 border-b border-accent-soft">
                <th className="text-left py-3 px-4 text-xs font-semibold text-graphite/60 uppercase tracking-wider">Name</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-graphite/60 uppercase tracking-wider">Type</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-graphite/60 uppercase tracking-wider">Items</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-graphite/60 uppercase tracking-wider">Featured</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-graphite/60 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-accent-soft/50">
                    <td className="py-3 px-4"><div className="h-4 w-32 bg-accent-soft rounded animate-pulse" /></td>
                    <td className="py-3 px-4"><div className="h-4 w-20 bg-accent-soft rounded animate-pulse" /></td>
                    <td className="py-3 px-4"><div className="h-4 w-8 bg-accent-soft rounded animate-pulse mx-auto" /></td>
                    <td className="py-3 px-4"><div className="h-4 w-8 bg-accent-soft rounded animate-pulse mx-auto" /></td>
                    <td className="py-3 px-4" />
                  </tr>
                ))
              ) : collections.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-graphite/60">
                    <Layers className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p>No collections created yet</p>
                  </td>
                </tr>
              ) : (
                collections.map((col) => (
                  <tr key={col.id} className="border-b border-accent-soft/50 hover:bg-accent-soft/30 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-medium text-graphite">{col.name}</p>
                      <p className="text-xs text-graphite/60/60">{col.slug}</p>
                    </td>
                    <td className="py-3 px-4">
                      {col.collection_type ? (
                        <span className="text-[10px] font-semibold bg-accent/10 text-accent px-2 py-0.5 rounded-pill capitalize">
                          {col.collection_type}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="py-3 px-4 text-center text-graphite/60">{col.item_count}</td>
                    <td className="py-3 px-4 text-center">
                      <button onClick={() => toggleFeatured(col.id, col.is_featured)}>
                        <Star className={`w-4 h-4 mx-auto ${col.is_featured ? 'text-signal-warn fill-signal-warn' : 'text-graphite/60/30'}`} />
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(col)} className="p-1.5 rounded-lg hover:bg-accent-soft text-graphite/60 hover:text-graphite" title="Edit">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(col.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-graphite/60 hover:text-red-600" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-graphite/40">
          <div className="bg-white rounded-2xl shadow-modal w-full max-w-lg m-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-accent-soft">
              <h2 className="font-sans font-semibold text-lg text-graphite">
                {editId ? 'Edit Collection' : 'New Collection'}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-accent-soft text-graphite/60">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-graphite/60 mb-1">Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 border border-accent-soft rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-graphite/20" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-graphite/60 mb-1">Slug *</label>
                <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full px-3 py-2 border border-accent-soft rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-graphite/20" placeholder="actives" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-graphite/60 mb-1">Type</label>
                <select value={form.collection_type} onChange={(e) => setForm({ ...form, collection_type: e.target.value })} className="w-full px-3 py-2 border border-accent-soft rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-graphite/20">
                  <option value="">—</option>
                  {COLLECTION_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-graphite/60 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-accent-soft rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-graphite/20" />
              </div>
              <label className="inline-flex items-center gap-2 text-sm font-sans text-graphite">
                <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="rounded border-accent-soft" />
                Featured collection
              </label>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-accent-soft">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-sans text-graphite/60 hover:text-graphite">Cancel</button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim() || !form.slug.trim()}
                className="px-4 py-2 bg-graphite text-white text-sm font-sans font-medium rounded-lg hover:bg-graphite-dark transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : editId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
