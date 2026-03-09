// AdminShopShipping.tsx — /admin/shop/shipping — Shipping methods management (LIVE — shipping_methods table)
import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Truck } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import type { ShippingMethod } from '../../lib/shop/types';
import { formatCents } from '../../lib/shop/types';

export default function AdminShopShipping() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ShippingMethod | null>(null);
  const [form, setForm] = useState({
    name: '', description: '', carrier: '',
    estimated_days_min: 0, estimated_days_max: 0,
    base_rate_cents: 0, per_item_rate_cents: 0,
    free_above_cents: 0, is_active: true, sort_order: 0,
  });

  const { data: methods = [], isLoading: loading } = useQuery({
    queryKey: ['admin-shop-shipping'],
    queryFn: async () => {
      const { data, error } = await supabase.from('shipping_methods').select('*').order('sort_order');
      if (error) throw new Error(error.message);
      return (data as ShippingMethod[]) ?? [];
    },
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '', carrier: '', estimated_days_min: 0, estimated_days_max: 0, base_rate_cents: 0, per_item_rate_cents: 0, free_above_cents: 0, is_active: true, sort_order: 0 });
    setShowForm(true);
  };

  const openEdit = (m: ShippingMethod) => {
    setEditing(m);
    setForm({
      name: m.name, description: m.description ?? '', carrier: m.carrier ?? '',
      estimated_days_min: m.estimated_days_min ?? 0, estimated_days_max: m.estimated_days_max ?? 0,
      base_rate_cents: m.base_rate_cents ?? 0, per_item_rate_cents: m.per_item_rate_cents ?? 0,
      free_above_cents: m.free_above_cents ?? 0, is_active: m.is_active ?? true, sort_order: m.sort_order ?? 0,
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    const payload = {
      name: form.name, description: form.description || null, carrier: form.carrier || null,
      estimated_days_min: form.estimated_days_min || null, estimated_days_max: form.estimated_days_max || null,
      base_rate_cents: form.base_rate_cents, per_item_rate_cents: form.per_item_rate_cents,
      free_above_cents: form.free_above_cents || null, is_active: form.is_active, sort_order: form.sort_order,
    };
    if (editing) await supabase.from('shipping_methods').update(payload).eq('id', editing.id);
    else await supabase.from('shipping_methods').insert(payload);
    setShowForm(false);
    queryClient.invalidateQueries({ queryKey: ['admin-shop-shipping'] });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this shipping method?')) return;
    await supabase.from('shipping_methods').delete().eq('id', id);
    queryClient.invalidateQueries({ queryKey: ['admin-shop-shipping'] });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-sans font-semibold text-graphite">Shipping Methods</h1>
        <button onClick={openCreate} className="flex items-center gap-2 h-10 px-4 bg-graphite text-white text-sm font-sans font-semibold rounded-lg hover:bg-graphite-dark transition-colors">
          <Plus className="w-4 h-4" /> Add Method
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-graphite/40">
          <div className="bg-white rounded-xl shadow-modal w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-sans font-semibold text-graphite">{editing ? 'Edit Method' : 'New Method'}</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-graphite/60" /></button>
            </div>
            <div className="space-y-4">
              <div><label className="text-xs font-semibold text-graphite/60 uppercase block mb-1">Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full h-10 px-3 border border-accent-soft rounded-lg text-sm font-sans" /></div>
              <div><label className="text-xs font-semibold text-graphite/60 uppercase block mb-1">Carrier</label>
                <input value={form.carrier} onChange={e => setForm(f => ({ ...f, carrier: e.target.value }))} className="w-full h-10 px-3 border border-accent-soft rounded-lg text-sm font-sans" /></div>
              <div><label className="text-xs font-semibold text-graphite/60 uppercase block mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full px-3 py-2 border border-accent-soft rounded-lg text-sm font-sans resize-none" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-semibold text-graphite/60 uppercase block mb-1">Min Days</label>
                  <input type="number" value={form.estimated_days_min} onChange={e => setForm(f => ({ ...f, estimated_days_min: parseInt(e.target.value) || 0 }))} className="w-full h-10 px-3 border border-accent-soft rounded-lg text-sm font-sans" /></div>
                <div><label className="text-xs font-semibold text-graphite/60 uppercase block mb-1">Max Days</label>
                  <input type="number" value={form.estimated_days_max} onChange={e => setForm(f => ({ ...f, estimated_days_max: parseInt(e.target.value) || 0 }))} className="w-full h-10 px-3 border border-accent-soft rounded-lg text-sm font-sans" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-semibold text-graphite/60 uppercase block mb-1">Base Rate (cents)</label>
                  <input type="number" value={form.base_rate_cents} onChange={e => setForm(f => ({ ...f, base_rate_cents: parseInt(e.target.value) || 0 }))} className="w-full h-10 px-3 border border-accent-soft rounded-lg text-sm font-sans" /></div>
                <div><label className="text-xs font-semibold text-graphite/60 uppercase block mb-1">Per Item (cents)</label>
                  <input type="number" value={form.per_item_rate_cents} onChange={e => setForm(f => ({ ...f, per_item_rate_cents: parseInt(e.target.value) || 0 }))} className="w-full h-10 px-3 border border-accent-soft rounded-lg text-sm font-sans" /></div>
              </div>
              <div><label className="text-xs font-semibold text-graphite/60 uppercase block mb-1">Free Above (cents, 0 = never)</label>
                <input type="number" value={form.free_above_cents} onChange={e => setForm(f => ({ ...f, free_above_cents: parseInt(e.target.value) || 0 }))} className="w-full h-10 px-3 border border-accent-soft rounded-lg text-sm font-sans" /></div>
              <div><label className="text-xs font-semibold text-graphite/60 uppercase block mb-1">Sort Order</label>
                <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} className="w-full h-10 px-3 border border-accent-soft rounded-lg text-sm font-sans" /></div>
              <label className="flex items-center gap-2 text-sm font-sans text-graphite">
                <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="rounded" /> Active
              </label>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowForm(false)} className="h-10 px-4 border border-accent-soft text-graphite/60 text-sm font-sans rounded-lg hover:bg-accent-soft">Cancel</button>
              <button onClick={handleSave} className="h-10 px-6 bg-graphite text-white text-sm font-sans font-semibold rounded-lg hover:bg-graphite-dark">Save</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-accent-soft overflow-hidden">
        <table className="w-full text-sm font-sans">
          <thead className="bg-accent-soft border-b border-accent-soft">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-graphite/60 text-xs uppercase">Method</th>
              <th className="text-left px-4 py-3 font-semibold text-graphite/60 text-xs uppercase">Carrier</th>
              <th className="text-left px-4 py-3 font-semibold text-graphite/60 text-xs uppercase">Rate</th>
              <th className="text-left px-4 py-3 font-semibold text-graphite/60 text-xs uppercase">Days</th>
              <th className="text-left px-4 py-3 font-semibold text-graphite/60 text-xs uppercase">Active</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="px-4 py-8 text-center text-graphite/60">Loading...</td></tr>}
            {!loading && methods.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-graphite/60">
                <Truck className="w-8 h-8 mx-auto mb-2 opacity-30" />No shipping methods yet
              </td></tr>
            )}
            {methods.map(m => (
              <tr key={m.id} className="border-b border-accent-soft/50 hover:bg-accent-soft/50">
                <td className="px-4 py-3 font-semibold text-graphite">{m.name}</td>
                <td className="px-4 py-3 text-graphite/60">{m.carrier ?? '-'}</td>
                <td className="px-4 py-3 text-graphite">{formatCents(m.base_rate_cents)}</td>
                <td className="px-4 py-3 text-graphite/60">{m.estimated_days_min ?? '?'}-{m.estimated_days_max ?? '?'}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${m.is_active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>{m.is_active ? 'Active' : 'Inactive'}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => openEdit(m)} className="text-graphite/60 hover:text-graphite"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(m.id)} className="text-graphite/60 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
