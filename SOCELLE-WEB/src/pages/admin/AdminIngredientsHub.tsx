import { useEffect, useState } from 'react';
import {
  Search,
  Plus,
  Pencil,
  Leaf,
  RefreshCw,
  X,
  AlertCircle,
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import ErrorState from '../../components/ErrorState';

// ── WO-OVERHAUL-12: Admin Ingredients Hub ───────────────────────────────────
// Data source: ingredients table (LIVE)

interface AdminIngredient {
  id: string;
  inci_name: string;
  common_name: string | null;
  ewg_score: number | null;
  comedogenic_rating: number | null;
  is_vegan: boolean | null;
  eu_status: string | null;
  updated_at: string;
}

interface IngredientForm {
  inci_name: string;
  common_name: string;
  cas_number: string;
  ewg_score: string;
  comedogenic_rating: string;
  description: string;
  skin_types: string;
  benefits: string;
  concerns: string;
  is_vegan: boolean;
  is_cruelty_free: boolean;
  is_natural: boolean;
  is_fragrance: boolean;
  is_allergen: boolean;
  eu_status: string;
  function: string;
}

const EMPTY_FORM: IngredientForm = {
  inci_name: '',
  common_name: '',
  cas_number: '',
  ewg_score: '',
  comedogenic_rating: '',
  description: '',
  skin_types: '',
  benefits: '',
  concerns: '',
  is_vegan: false,
  is_cruelty_free: false,
  is_natural: false,
  is_fragrance: false,
  is_allergen: false,
  eu_status: '',
  function: '',
};

export default function AdminIngredientsHub() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<IngredientForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), search ? 300 : 0);
    return () => clearTimeout(t);
  }, [search]);

  const { data: queryResult, isLoading: loading, error: queryError } = useQuery({
    queryKey: ['admin-ingredients', debouncedSearch],
    queryFn: async () => {
      let query = supabase
        .from('ingredients')
        .select('id, inci_name, common_name, ewg_score, comedogenic_rating, is_vegan, eu_status, updated_at', { count: 'exact' })
        .order('inci_name')
        .limit(100);

      if (debouncedSearch.trim()) {
        query = query.or(`inci_name.ilike.%${debouncedSearch.trim()}%,common_name.ilike.%${debouncedSearch.trim()}%`);
      }

      const { data, error: err, count } = await query;
      if (err) throw err;
      return { ingredients: (data ?? []) as AdminIngredient[], total: count ?? 0 };
    },
  });

  const ingredients = queryResult?.ingredients ?? [];
  const total = queryResult?.total ?? 0;
  const isLive = !queryError;
  const error = queryError ? (queryError as Error).message : null;

  const openCreate = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = async (id: string) => {
    const { data } = await supabase
      .from('ingredients')
      .select('*')
      .eq('id', id)
      .single();
    if (!data) return;
    setEditId(id);
    setForm({
      inci_name: data.inci_name ?? '',
      common_name: data.common_name ?? '',
      cas_number: data.cas_number ?? '',
      ewg_score: data.ewg_score?.toString() ?? '',
      comedogenic_rating: data.comedogenic_rating?.toString() ?? '',
      description: data.description ?? '',
      skin_types: (data.skin_types ?? []).join(', '),
      benefits: (data.benefits ?? []).join(', '),
      concerns: (data.concerns ?? []).join(', '),
      is_vegan: data.is_vegan ?? false,
      is_cruelty_free: data.is_cruelty_free ?? false,
      is_natural: data.is_natural ?? false,
      is_fragrance: data.is_fragrance ?? false,
      is_allergen: data.is_allergen ?? false,
      eu_status: data.eu_status ?? '',
      function: (data.function ?? []).join(', '),
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        inci_name: form.inci_name.trim(),
        common_name: form.common_name.trim() || null,
        cas_number: form.cas_number.trim() || null,
        ewg_score: form.ewg_score ? parseInt(form.ewg_score) : null,
        comedogenic_rating: form.comedogenic_rating ? parseInt(form.comedogenic_rating) : null,
        description: form.description.trim() || null,
        skin_types: form.skin_types ? form.skin_types.split(',').map((s) => s.trim()).filter(Boolean) : [],
        benefits: form.benefits ? form.benefits.split(',').map((s) => s.trim()).filter(Boolean) : [],
        concerns: form.concerns ? form.concerns.split(',').map((s) => s.trim()).filter(Boolean) : [],
        is_vegan: form.is_vegan,
        is_cruelty_free: form.is_cruelty_free,
        is_natural: form.is_natural,
        is_fragrance: form.is_fragrance,
        is_allergen: form.is_allergen,
        eu_status: form.eu_status || null,
        function: form.function ? form.function.split(',').map((s) => s.trim()).filter(Boolean) : [],
      };

      if (editId) {
        const { error: err } = await supabase.from('ingredients').update(payload).eq('id', editId);
        if (err) throw err;
      } else {
        const { error: err } = await supabase.from('ingredients').insert(payload);
        if (err) throw err;
      }

      setShowForm(false);
      setEditId(null);
      setForm(EMPTY_FORM);
      queryClient.invalidateQueries({ queryKey: ['admin-ingredients'] });
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const { error: err } = await supabase.functions.invoke('open-beauty-facts-sync');
      if (err) throw err;
      fetchIngredients();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const ewgColor = (score: number | null) => {
    if (score == null) return '';
    if (score <= 2) return 'text-signal-up';
    if (score <= 6) return 'text-signal-warn';
    return 'text-signal-down';
  };

  if (error) return <ErrorState message={error} onRetry={fetchIngredients} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-sans font-semibold text-graphite">Ingredients</h1>
          <p className="text-graphite/60 font-sans text-sm mt-0.5">
            {total.toLocaleString()} ingredients in database
            {isLive ? (
              <span className="ml-2 text-[10px] font-semibold bg-signal-up/10 text-signal-up px-2 py-0.5 rounded-pill">LIVE</span>
            ) : (
              <span className="ml-2 text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-pill">DEMO</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent-soft text-graphite text-sm font-sans font-medium rounded-lg hover:bg-accent-soft transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync from API'}
          </button>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2 bg-graphite text-white text-sm font-sans font-medium rounded-lg hover:bg-graphite-dark transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Ingredient
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-graphite/60/60" />
        <input
          type="search"
          placeholder="Search ingredients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white border border-accent-soft rounded-lg text-sm font-sans text-graphite placeholder:text-graphite/60/50 focus:outline-none focus:ring-2 focus:ring-graphite/20"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-accent-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-sans">
            <thead>
              <tr className="bg-accent-soft/50 border-b border-accent-soft">
                <th className="text-left py-3 px-4 text-xs font-semibold text-graphite/60 uppercase tracking-wider">INCI Name</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-graphite/60 uppercase tracking-wider">Common Name</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-graphite/60 uppercase tracking-wider">EWG</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-graphite/60 uppercase tracking-wider">Comedogenic</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-graphite/60 uppercase tracking-wider">Vegan</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-graphite/60 uppercase tracking-wider">EU Status</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-graphite/60 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-accent-soft/50">
                    <td className="py-3 px-4"><div className="h-4 w-40 bg-accent-soft rounded animate-pulse" /></td>
                    <td className="py-3 px-4"><div className="h-4 w-24 bg-accent-soft rounded animate-pulse" /></td>
                    <td className="py-3 px-4"><div className="h-4 w-8 bg-accent-soft rounded animate-pulse mx-auto" /></td>
                    <td className="py-3 px-4"><div className="h-4 w-8 bg-accent-soft rounded animate-pulse mx-auto" /></td>
                    <td className="py-3 px-4"><div className="h-4 w-8 bg-accent-soft rounded animate-pulse mx-auto" /></td>
                    <td className="py-3 px-4"><div className="h-4 w-16 bg-accent-soft rounded animate-pulse mx-auto" /></td>
                    <td className="py-3 px-4" />
                  </tr>
                ))
              ) : ingredients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-graphite/60">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p>No ingredients found</p>
                  </td>
                </tr>
              ) : (
                ingredients.map((ing) => (
                  <tr key={ing.id} className="border-b border-accent-soft/50 hover:bg-accent-soft/30 transition-colors">
                    <td className="py-3 px-4 font-medium text-graphite">{ing.inci_name}</td>
                    <td className="py-3 px-4 text-graphite/60">{ing.common_name || '—'}</td>
                    <td className={`py-3 px-4 text-center font-semibold ${ewgColor(ing.ewg_score)}`}>
                      {ing.ewg_score ?? '—'}
                    </td>
                    <td className="py-3 px-4 text-center text-graphite/60">{ing.comedogenic_rating ?? '—'}</td>
                    <td className="py-3 px-4 text-center">
                      {ing.is_vegan ? (
                        <Leaf className="w-4 h-4 text-signal-up mx-auto" />
                      ) : (
                        <span className="text-graphite/60/40">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {ing.eu_status ? (
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-pill capitalize ${
                          ing.eu_status === 'allowed' ? 'bg-signal-up/10 text-signal-up'
                            : ing.eu_status === 'restricted' ? 'bg-signal-warn/10 text-signal-warn'
                              : 'bg-signal-down/10 text-signal-down'
                        }`}>
                          {ing.eu_status}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => openEdit(ing.id)}
                        className="p-1.5 rounded-lg hover:bg-accent-soft text-graphite/60 hover:text-graphite transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
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
          <div className="bg-white rounded-2xl shadow-modal w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-accent-soft">
              <h2 className="font-sans font-semibold text-lg text-graphite">
                {editId ? 'Edit Ingredient' : 'Add Ingredient'}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-accent-soft text-graphite/60">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-graphite/60 mb-1">INCI Name *</label>
                  <input value={form.inci_name} onChange={(e) => setForm({ ...form, inci_name: e.target.value })} className="w-full px-3 py-2 border border-accent-soft rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-graphite/20" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-graphite/60 mb-1">Common Name</label>
                  <input value={form.common_name} onChange={(e) => setForm({ ...form, common_name: e.target.value })} className="w-full px-3 py-2 border border-accent-soft rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-graphite/20" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-graphite/60 mb-1">CAS Number</label>
                  <input value={form.cas_number} onChange={(e) => setForm({ ...form, cas_number: e.target.value })} className="w-full px-3 py-2 border border-accent-soft rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-graphite/20" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-graphite/60 mb-1">EWG Score (1-10)</label>
                  <input type="number" min={1} max={10} value={form.ewg_score} onChange={(e) => setForm({ ...form, ewg_score: e.target.value })} className="w-full px-3 py-2 border border-accent-soft rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-graphite/20" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-graphite/60 mb-1">Comedogenic (0-5)</label>
                  <input type="number" min={0} max={5} value={form.comedogenic_rating} onChange={(e) => setForm({ ...form, comedogenic_rating: e.target.value })} className="w-full px-3 py-2 border border-accent-soft rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-graphite/20" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-graphite/60 mb-1">EU Status</label>
                <select value={form.eu_status} onChange={(e) => setForm({ ...form, eu_status: e.target.value })} className="w-full px-3 py-2 border border-accent-soft rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-graphite/20">
                  <option value="">—</option>
                  <option value="allowed">Allowed</option>
                  <option value="restricted">Restricted</option>
                  <option value="banned">Banned</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-graphite/60 mb-1">Functions (comma-separated)</label>
                <input value={form.function} onChange={(e) => setForm({ ...form, function: e.target.value })} className="w-full px-3 py-2 border border-accent-soft rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-graphite/20" placeholder="emollient, humectant, surfactant" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-graphite/60 mb-1">Skin Types (comma-separated)</label>
                <input value={form.skin_types} onChange={(e) => setForm({ ...form, skin_types: e.target.value })} className="w-full px-3 py-2 border border-accent-soft rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-graphite/20" placeholder="oily, dry, sensitive, normal, combination, all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-graphite/60 mb-1">Benefits (comma-separated)</label>
                <input value={form.benefits} onChange={(e) => setForm({ ...form, benefits: e.target.value })} className="w-full px-3 py-2 border border-accent-soft rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-graphite/20" placeholder="moisturizing, anti-aging, brightening" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-graphite/60 mb-1">Concerns (comma-separated)</label>
                <input value={form.concerns} onChange={(e) => setForm({ ...form, concerns: e.target.value })} className="w-full px-3 py-2 border border-accent-soft rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-graphite/20" placeholder="irritation, drying" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-graphite/60 mb-1">Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-accent-soft rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-graphite/20" />
              </div>
              <div className="flex flex-wrap gap-4">
                {(['is_vegan', 'is_cruelty_free', 'is_natural', 'is_fragrance', 'is_allergen'] as const).map((key) => (
                  <label key={key} className="inline-flex items-center gap-2 text-sm font-sans text-graphite">
                    <input
                      type="checkbox"
                      checked={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                      className="rounded border-accent-soft"
                    />
                    {key.replace('is_', '').replace('_', '-')}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-accent-soft">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-sans text-graphite/60 hover:text-graphite">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.inci_name.trim()}
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
