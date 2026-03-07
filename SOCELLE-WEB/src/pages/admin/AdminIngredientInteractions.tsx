import { useEffect, useState, useCallback } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  X,
  AlertCircle,
  GitMerge,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ErrorState from '../../components/ErrorState';

// ── WO-OVERHAUL-12: Admin Ingredient Interactions ───────────────────────────

interface Interaction {
  id: string;
  ingredient_id_a: string;
  ingredient_id_b: string;
  interaction_type: string;
  explanation: string | null;
  source: string | null;
  name_a: string;
  name_b: string;
}

interface InteractionForm {
  ingredient_name_a: string;
  ingredient_name_b: string;
  interaction_type: string;
  explanation: string;
  source: string;
}

const EMPTY_FORM: InteractionForm = {
  ingredient_name_a: '',
  ingredient_name_b: '',
  interaction_type: 'synergistic',
  explanation: '',
  source: '',
};

const INTERACTION_TYPES = ['synergistic', 'avoid', 'caution', 'neutral'];

const TYPE_STYLES: Record<string, string> = {
  synergistic: 'bg-signal-up/10 text-signal-up',
  avoid: 'bg-signal-down/10 text-signal-down',
  caution: 'bg-signal-warn/10 text-signal-warn',
  neutral: 'bg-graphite/10 text-graphite/60',
};

export default function AdminIngredientInteractions() {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<InteractionForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchInteractions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('ingredient_interactions')
        .select('id, ingredient_id_a, ingredient_id_b, interaction_type, explanation, source')
        .order('interaction_type')
        .limit(200);

      if (err) throw err;

      // Resolve ingredient names
      const allIds = new Set<string>();
      (data ?? []).forEach((i) => { allIds.add(i.ingredient_id_a); allIds.add(i.ingredient_id_b); });

      let nameMap: Record<string, string> = {};
      if (allIds.size > 0) {
        const { data: ings } = await supabase
          .from('ingredients')
          .select('id, inci_name')
          .in('id', Array.from(allIds));
        if (ings) nameMap = Object.fromEntries(ings.map((i) => [i.id, i.inci_name]));
      }

      setInteractions(
        (data ?? []).map((i) => ({
          ...i,
          name_a: nameMap[i.ingredient_id_a] ?? 'Unknown',
          name_b: nameMap[i.ingredient_id_b] ?? 'Unknown',
        }))
      );
      setIsLive(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load interactions');
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInteractions(); }, [fetchInteractions]);

  const openCreate = () => {
    setEditId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (inter: Interaction) => {
    setEditId(inter.id);
    setForm({
      ingredient_name_a: inter.name_a,
      ingredient_name_b: inter.name_b,
      interaction_type: inter.interaction_type,
      explanation: inter.explanation ?? '',
      source: inter.source ?? '',
    });
    setShowForm(true);
  };

  const resolveIngredientId = async (name: string): Promise<string | null> => {
    const { data } = await supabase
      .from('ingredients')
      .select('id')
      .ilike('inci_name', name.trim())
      .limit(1)
      .maybeSingle();
    return data?.id ?? null;
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let idA = await resolveIngredientId(form.ingredient_name_a);
      let idB = await resolveIngredientId(form.ingredient_name_b);

      if (!idA || !idB) {
        alert('Could not find one or both ingredients by INCI name. Please check spelling.');
        setSaving(false);
        return;
      }

      // Ensure a < b per CHECK constraint
      if (idA > idB) {
        [idA, idB] = [idB, idA];
      }

      const payload = {
        ingredient_id_a: idA,
        ingredient_id_b: idB,
        interaction_type: form.interaction_type,
        explanation: form.explanation.trim() || null,
        source: form.source.trim() || null,
      };

      if (editId) {
        const { error: err } = await supabase.from('ingredient_interactions').update(payload).eq('id', editId);
        if (err) throw err;
      } else {
        const { error: err } = await supabase.from('ingredient_interactions').insert(payload);
        if (err) throw err;
      }

      setShowForm(false);
      setEditId(null);
      fetchInteractions();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this interaction?')) return;
    const { error: err } = await supabase.from('ingredient_interactions').delete().eq('id', id);
    if (err) alert(err.message);
    else fetchInteractions();
  };

  if (error) return <ErrorState message={error} onRetry={fetchInteractions} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-sans font-semibold text-pro-charcoal">Ingredient Interactions</h1>
          <p className="text-pro-warm-gray font-sans text-sm mt-0.5">
            {interactions.length} interactions
            {isLive ? (
              <span className="ml-2 text-[10px] font-semibold bg-signal-up/10 text-signal-up px-2 py-0.5 rounded-pill">LIVE</span>
            ) : (
              <span className="ml-2 text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-pill">DEMO</span>
            )}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-pro-navy text-white text-sm font-sans font-medium rounded-lg hover:bg-pro-navy-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Interaction
        </button>
      </div>

      <div className="bg-white rounded-xl border border-pro-stone overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-sans">
            <thead>
              <tr className="bg-pro-cream/50 border-b border-pro-stone">
                <th className="text-left py-3 px-4 text-xs font-semibold text-pro-warm-gray uppercase tracking-wider">Ingredient A</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-pro-warm-gray uppercase tracking-wider">Ingredient B</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-pro-warm-gray uppercase tracking-wider">Type</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-pro-warm-gray uppercase tracking-wider">Explanation</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-pro-warm-gray uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-pro-stone/50">
                    <td className="py-3 px-4"><div className="h-4 w-32 bg-pro-cream rounded animate-pulse" /></td>
                    <td className="py-3 px-4"><div className="h-4 w-32 bg-pro-cream rounded animate-pulse" /></td>
                    <td className="py-3 px-4"><div className="h-4 w-16 bg-pro-cream rounded animate-pulse mx-auto" /></td>
                    <td className="py-3 px-4"><div className="h-4 w-48 bg-pro-cream rounded animate-pulse" /></td>
                    <td className="py-3 px-4" />
                  </tr>
                ))
              ) : interactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-pro-warm-gray">
                    <GitMerge className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p>No interactions defined yet</p>
                  </td>
                </tr>
              ) : (
                interactions.map((inter) => (
                  <tr key={inter.id} className="border-b border-pro-stone/50 hover:bg-pro-cream/30 transition-colors">
                    <td className="py-3 px-4 font-medium text-pro-charcoal">{inter.name_a}</td>
                    <td className="py-3 px-4 font-medium text-pro-charcoal">{inter.name_b}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-pill capitalize ${TYPE_STYLES[inter.interaction_type] || ''}`}>
                        {inter.interaction_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-pro-warm-gray text-xs max-w-xs truncate">{inter.explanation || '—'}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(inter)} className="p-1.5 rounded-lg hover:bg-pro-cream text-pro-warm-gray hover:text-pro-charcoal" title="Edit">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(inter.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-pro-warm-gray hover:text-red-600" title="Delete">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-pro-charcoal/40">
          <div className="bg-white rounded-2xl shadow-modal w-full max-w-lg m-4">
            <div className="flex items-center justify-between px-6 py-4 border-b border-pro-stone">
              <h2 className="font-sans font-semibold text-lg text-pro-charcoal">
                {editId ? 'Edit Interaction' : 'New Interaction'}
              </h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg hover:bg-pro-cream text-pro-warm-gray">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-pro-warm-gray mb-1">Ingredient A (INCI name) *</label>
                <input value={form.ingredient_name_a} onChange={(e) => setForm({ ...form, ingredient_name_a: e.target.value })} className="w-full px-3 py-2 border border-pro-stone rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-pro-navy/20" placeholder="NIACINAMIDE" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-pro-warm-gray mb-1">Ingredient B (INCI name) *</label>
                <input value={form.ingredient_name_b} onChange={(e) => setForm({ ...form, ingredient_name_b: e.target.value })} className="w-full px-3 py-2 border border-pro-stone rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-pro-navy/20" placeholder="VITAMIN C" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-pro-warm-gray mb-1">Interaction Type *</label>
                <select value={form.interaction_type} onChange={(e) => setForm({ ...form, interaction_type: e.target.value })} className="w-full px-3 py-2 border border-pro-stone rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-pro-navy/20">
                  {INTERACTION_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-pro-warm-gray mb-1">Explanation</label>
                <textarea value={form.explanation} onChange={(e) => setForm({ ...form, explanation: e.target.value })} rows={3} className="w-full px-3 py-2 border border-pro-stone rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-pro-navy/20" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-pro-warm-gray mb-1">Source</label>
                <input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} className="w-full px-3 py-2 border border-pro-stone rounded-lg text-sm font-sans focus:outline-none focus:ring-2 focus:ring-pro-navy/20" placeholder="PubMed, dermatology textbook, etc." />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-pro-stone">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-sans text-pro-warm-gray hover:text-pro-charcoal">Cancel</button>
              <button
                onClick={handleSave}
                disabled={saving || !form.ingredient_name_a.trim() || !form.ingredient_name_b.trim()}
                className="px-4 py-2 bg-pro-navy text-white text-sm font-sans font-medium rounded-lg hover:bg-pro-navy-dark transition-colors disabled:opacity-50"
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
