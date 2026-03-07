// AdminShopShipping.tsx — /admin/shop/shipping — Shipping methods management (LIVE — shipping_methods table)
import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Truck } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { ShippingMethod } from '../../lib/shop/types';
import { formatCents } from '../../lib/shop/types';

export default function AdminShopShipping() {
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ShippingMethod | null>(null);
  const [form, setForm] = useState({
    name: '', description: '', carrier: '',
    estimated_days_min: 0, estimated_days_max: 0,
    base_rate_cents: 0, per_item_rate_cents: 0,
    free_above_cents: 0, is_active: true, sort_order: 0,
  });

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('shipping_methods').select('*').order('sort_order');
    setMethods((data as ShippingMethod[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

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
      base_rate_cents: m.base_rate_cents, per_item_rate_cents: m.per_item_rate_cents,
      free_above_cents: m.free_above_cents ?? 0, is_active: m.is_active, sort_order: m.sort_order,
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
    fetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this shipping method?')) return;
    await supabase.from('shipping_methods').delete().eq('id', id);
    fetch();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-sans font-semibold text-pro-charcoal">Shipping Methods</h1>
        <button onClick={openCreate} className="flex items-center gap-2 h-10 px-4 bg-pro-navy text-white text-sm font-sans font-semibold rounded-lg hover:bg-pro-navy-dark transition-colors">
          <Plus className="w-4 h-4" /> Add Method
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-pro-charcoal/40">
          <div className="bg-white rounded-xl shadow-modal w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-sans font-semibold text-pro-charcoal">{editing ? 'Edit Method' : 'New Method'}</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-pro-warm-gray" /></button>
            </div>
            <div className="space-y-4">
              <div><label className="text-xs font-semibold text-pro-warm-gray uppercase block mb-1">Name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full h-10 px-3 border border-pro-stone rounded-lg text-sm font-sans" /></div>
              <div><label className="text-xs font-semibold text-pro-warm-gray uppercase block mb-1">Carrier</label>
                <input value={form.carrier} onChange={e => setForm(f => ({ ...f, carrier: e.target.value }))} className="w-full h-10 px-3 border border-pro-stone rounded-lg text-sm font-sans" /></div>
              <div><label className="text-xs font-semibold text-pro-warm-gray uppercase block mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full px-3 py-2 border border-pro-stone rounded-lg text-sm font-sans resize-none" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-semibold text-pro-warm-gray uppercase block mb-1">Min Days</label>
                  <input type="number" value={form.estimated_days_min} onChange={e => setForm(f => ({ ...f, estimated_days_min: parseInt(e.target.value) || 0 }))} className="w-full h-10 px-3 border border-pro-stone rounded-lg text-sm font-sans" /></div>
                <div><label className="text-xs font-semibold text-pro-warm-gray uppercase block mb-1">Max Days</label>
                  <input type="number" value={form.estimated_days_max} onChange={e => setForm(f => ({ ...f, estimated_days_max: parseInt(e.target.value) || 0 }))} className="w-full h-10 px-3 border border-pro-stone rounded-lg text-sm font-sans" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-semibold text-pro-warm-gray uppercase block mb-1">Base Rate (cents)</label>
                  <input type="number" value={form.base_rate_cents} onChange={e => setForm(f => ({ ...f, base_rate_cents: parseInt(e.target.value) || 0 }))} className="w-full h-10 px-3 border border-pro-stone rounded-lg text-sm font-sans" /></div>
                <div><label className="text-xs font-semibold text-pro-warm-gray uppercase block mb-1">Per Item (cents)</label>
                  <input type="number" value={form.per_item_rate_cents} onChange={e => setForm(f => ({ ...f, per_item_rate_cents: parseInt(e.target.value) || 0 }))} className="w-full h-10 px-3 border border-pro-stone rounded-lg text-sm font-sans" /></div>
              </div>
              <div><label className="text-xs font-semibold text-pro-warm-gray uppercase block mb-1">Free Above (cents, 0 = never)</label>
                <input type="number" value={form.free_above_cents} onChange={e => setForm(f => ({ ...f, free_above_cents: parseInt(e.target.value) || 0 }))} className="w-full h-10 px-3 border border-pro-stone rounded-lg text-sm font-sans" /></div>
              <div><label className="text-xs font-semibold text-pro-warm-gray uppercase block mb-1">Sort Order</label>
                <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} className="w-full h-10 px-3 border border-pro-stone rounded-lg text-sm font-sans" /></div>
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

      <div className="bg-white rounded-xl border border-pro-stone overflow-hidden">
        <table className="w-full text-sm font-sans">
          <thead className="bg-pro-cream border-b border-pro-stone">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-pro-warm-gray text-xs uppercase">Method</th>
              <th className="text-left px-4 py-3 font-semibold text-pro-warm-gray text-xs uppercase">Carrier</th>
              <th className="text-left px-4 py-3 font-semibold text-pro-warm-gray text-xs uppercase">Rate</th>
              <th className="text-left px-4 py-3 font-semibold text-pro-warm-gray text-xs uppercase">Days</th>
              <th className="text-left px-4 py-3 font-semibold text-pro-warm-gray text-xs uppercase">Active</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="px-4 py-8 text-center text-pro-warm-gray">Loading...</td></tr>}
            {!loading && methods.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-pro-warm-gray">
                <Truck className="w-8 h-8 mx-auto mb-2 opacity-30" />No shipping methods yet
              </td></tr>
            )}
            {methods.map(m => (
              <tr key={m.id} className="border-b border-pro-stone/50 hover:bg-pro-cream/50">
                <td className="px-4 py-3 font-semibold text-pro-charcoal">{m.name}</td>
                <td className="px-4 py-3 text-pro-warm-gray">{m.carrier ?? '-'}</td>
                <td className="px-4 py-3 text-pro-charcoal">{formatCents(m.base_rate_cents)}</td>
                <td className="px-4 py-3 text-pro-warm-gray">{m.estimated_days_min ?? '?'}-{m.estimated_days_max ?? '?'}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${m.is_active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>{m.is_active ? 'Active' : 'Inactive'}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => openEdit(m)} className="text-pro-warm-gray hover:text-pro-charcoal"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(m.id)} className="text-pro-warm-gray hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
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
