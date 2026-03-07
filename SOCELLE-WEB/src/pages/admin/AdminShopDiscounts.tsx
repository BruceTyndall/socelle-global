// AdminShopDiscounts.tsx — /admin/shop/discounts — Discount management (LIVE — discount_codes table)
import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Tag } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { DiscountCode } from '../../lib/shop/types';
import { formatCents } from '../../lib/shop/types';

const TYPES = ['percentage', 'fixed_amount', 'free_shipping'] as const;

export default function AdminShopDiscounts() {
  const [discounts, setDiscounts] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<DiscountCode | null>(null);
  const [form, setForm] = useState({
    code: '', type: 'percentage' as DiscountCode['type'],
    percentage: 0, value_cents: 0, minimum_order_cents: 0,
    maximum_uses: 0, is_active: true, expires_at: '',
  });

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('discount_codes').select('*').order('created_at', { ascending: false });
    setDiscounts((data as DiscountCode[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const openCreate = () => {
    setEditing(null);
    setForm({ code: '', type: 'percentage', percentage: 0, value_cents: 0, minimum_order_cents: 0, maximum_uses: 0, is_active: true, expires_at: '' });
    setShowForm(true);
  };

  const openEdit = (d: DiscountCode) => {
    setEditing(d);
    setForm({
      code: d.code, type: d.type,
      percentage: d.percentage ?? 0, value_cents: d.value_cents ?? 0,
      minimum_order_cents: d.minimum_order_cents ?? 0, maximum_uses: d.maximum_uses ?? 0,
      is_active: d.is_active, expires_at: d.expires_at?.split('T')[0] ?? '',
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    const payload = {
      code: form.code.toUpperCase(),
      type: form.type,
      percentage: form.type === 'percentage' ? form.percentage : null,
      value_cents: form.type === 'fixed_amount' ? form.value_cents : null,
      minimum_order_cents: form.minimum_order_cents || null,
      maximum_uses: form.maximum_uses || null,
      is_active: form.is_active,
      expires_at: form.expires_at || null,
    };
    if (editing) await supabase.from('discount_codes').update(payload).eq('id', editing.id);
    else await supabase.from('discount_codes').insert(payload);
    setShowForm(false);
    fetch();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this discount code?')) return;
    await supabase.from('discount_codes').delete().eq('id', id);
    fetch();
  };

  const toggleActive = async (d: DiscountCode) => {
    await supabase.from('discount_codes').update({ is_active: !d.is_active }).eq('id', d.id);
    fetch();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-sans font-semibold text-pro-charcoal">Discount Codes</h1>
        <button onClick={openCreate} className="flex items-center gap-2 h-10 px-4 bg-pro-navy text-white text-sm font-sans font-semibold rounded-lg hover:bg-pro-navy-dark transition-colors">
          <Plus className="w-4 h-4" /> Add Discount
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-pro-charcoal/40">
          <div className="bg-white rounded-xl shadow-modal w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-sans font-semibold text-pro-charcoal">{editing ? 'Edit Discount' : 'New Discount'}</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-pro-warm-gray" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-pro-warm-gray uppercase block mb-1">Code</label>
                <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} className="w-full h-10 px-3 border border-pro-stone rounded-lg text-sm font-sans font-mono uppercase" />
              </div>
              <div>
                <label className="text-xs font-semibold text-pro-warm-gray uppercase block mb-1">Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value as DiscountCode['type'] }))} className="w-full h-10 px-3 border border-pro-stone rounded-lg text-sm font-sans">
                  {TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                </select>
              </div>
              {form.type === 'percentage' && (
                <div>
                  <label className="text-xs font-semibold text-pro-warm-gray uppercase block mb-1">Percentage (%)</label>
                  <input type="number" value={form.percentage} onChange={e => setForm(f => ({ ...f, percentage: parseInt(e.target.value) || 0 }))} className="w-full h-10 px-3 border border-pro-stone rounded-lg text-sm font-sans" />
                </div>
              )}
              {form.type === 'fixed_amount' && (
                <div>
                  <label className="text-xs font-semibold text-pro-warm-gray uppercase block mb-1">Value (cents)</label>
                  <input type="number" value={form.value_cents} onChange={e => setForm(f => ({ ...f, value_cents: parseInt(e.target.value) || 0 }))} className="w-full h-10 px-3 border border-pro-stone rounded-lg text-sm font-sans" />
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-pro-warm-gray uppercase block mb-1">Min Order (cents)</label>
                <input type="number" value={form.minimum_order_cents} onChange={e => setForm(f => ({ ...f, minimum_order_cents: parseInt(e.target.value) || 0 }))} className="w-full h-10 px-3 border border-pro-stone rounded-lg text-sm font-sans" />
              </div>
              <div>
                <label className="text-xs font-semibold text-pro-warm-gray uppercase block mb-1">Max Uses (0 = unlimited)</label>
                <input type="number" value={form.maximum_uses} onChange={e => setForm(f => ({ ...f, maximum_uses: parseInt(e.target.value) || 0 }))} className="w-full h-10 px-3 border border-pro-stone rounded-lg text-sm font-sans" />
              </div>
              <div>
                <label className="text-xs font-semibold text-pro-warm-gray uppercase block mb-1">Expires At</label>
                <input type="date" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} className="w-full h-10 px-3 border border-pro-stone rounded-lg text-sm font-sans" />
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

      <div className="bg-white rounded-xl border border-pro-stone overflow-hidden">
        <table className="w-full text-sm font-sans">
          <thead className="bg-pro-cream border-b border-pro-stone">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-pro-warm-gray text-xs uppercase">Code</th>
              <th className="text-left px-4 py-3 font-semibold text-pro-warm-gray text-xs uppercase">Type</th>
              <th className="text-left px-4 py-3 font-semibold text-pro-warm-gray text-xs uppercase">Value</th>
              <th className="text-left px-4 py-3 font-semibold text-pro-warm-gray text-xs uppercase">Uses</th>
              <th className="text-left px-4 py-3 font-semibold text-pro-warm-gray text-xs uppercase">Active</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="px-4 py-8 text-center text-pro-warm-gray">Loading...</td></tr>}
            {!loading && discounts.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-pro-warm-gray">
                <Tag className="w-8 h-8 mx-auto mb-2 opacity-30" />No discount codes yet
              </td></tr>
            )}
            {discounts.map(d => (
              <tr key={d.id} className="border-b border-pro-stone/50 hover:bg-pro-cream/50">
                <td className="px-4 py-3 font-mono font-semibold text-pro-charcoal">{d.code}</td>
                <td className="px-4 py-3 text-pro-warm-gray">{d.type.replace('_', ' ')}</td>
                <td className="px-4 py-3 text-pro-charcoal">
                  {d.type === 'percentage' ? `${d.percentage}%` : d.type === 'fixed_amount' ? formatCents(d.value_cents ?? 0) : 'Free Ship'}
                </td>
                <td className="px-4 py-3 text-pro-charcoal">{d.current_uses}{d.maximum_uses ? `/${d.maximum_uses}` : ''}</td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleActive(d)} className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${d.is_active ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                    {d.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <button onClick={() => openEdit(d)} className="text-pro-warm-gray hover:text-pro-charcoal"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(d.id)} className="text-pro-warm-gray hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
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
