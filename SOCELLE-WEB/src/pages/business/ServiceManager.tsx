import { useState } from 'react';
import { Scissors, Plus, Pencil, Trash2, DollarSign, Clock, X } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useBookingServices, useServiceAddons, type NewService, type NewAddon } from '../../lib/useBooking';

export default function ServiceManager() {
  const { profile } = useAuth();
  const businessId = profile?.business_id;
  const { services, loading, isLive, createService, updateService, deleteService } = useBookingServices(businessId);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', category: '', duration_minutes: '60', price: '', buffer_minutes: '0', requires_consultation: false, max_per_day: '' });
  const [saving, setSaving] = useState(false);

  const resetForm = () => { setForm({ name: '', description: '', category: '', duration_minutes: '60', price: '', buffer_minutes: '0', requires_consultation: false, max_per_day: '' }); setEditId(null); setShowForm(false); };

  const handleEdit = (svc: typeof services[0]) => {
    setForm({
      name: svc.name,
      description: svc.description ?? '',
      category: svc.category ?? '',
      duration_minutes: String(svc.duration_minutes),
      price: String(svc.price),
      buffer_minutes: String(svc.buffer_minutes),
      requires_consultation: svc.requires_consultation,
      max_per_day: svc.max_per_day != null ? String(svc.max_per_day) : '',
    });
    setEditId(svc.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessId) return;
    setSaving(true);
    try {
      const payload: NewService = {
        business_id: businessId,
        name: form.name,
        description: form.description || undefined,
        category: form.category || undefined,
        duration_minutes: parseInt(form.duration_minutes) || 60,
        price: parseFloat(form.price) || 0,
        buffer_minutes: parseInt(form.buffer_minutes) || 0,
        requires_consultation: form.requires_consultation,
        max_per_day: form.max_per_day ? parseInt(form.max_per_day) : undefined,
      };
      if (editId) {
        await updateService(editId, payload);
      } else {
        await createService(payload);
      }
      resetForm();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this service?')) return;
    await deleteService(id);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-graphite">Services</h1>
          <p className="text-sm text-graphite/60 mt-1">Manage booking services and add-ons</p>
        </div>
        <div className="flex items-center gap-2">
          {!isLive && !loading && (
            <span className="text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-full">DEMO</span>
          )}
          <button onClick={() => { resetForm(); setShowForm(true); }} className="inline-flex items-center gap-2 h-9 px-4 bg-mn-dark text-white text-sm font-medium rounded-full hover:bg-mn-dark/90 transition-colors">
            <Plus className="w-4 h-4" /> Add Service
          </button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-accent-soft/30 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-graphite">{editId ? 'Edit Service' : 'New Service'}</h2>
            <button type="button" onClick={resetForm}><X className="w-4 h-4 text-graphite/60" /></button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-graphite/60 mb-1">Name *</label>
              <input type="text" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full h-10 px-3 border border-accent-soft/30 rounded-lg text-sm text-graphite focus:outline-none focus:border-accent/50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-graphite/60 mb-1">Category</label>
              <input type="text" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="e.g., Facial, Hair, Body" className="w-full h-10 px-3 border border-accent-soft/30 rounded-lg text-sm text-graphite placeholder:text-graphite/60 focus:outline-none focus:border-accent/50" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-graphite/60 mb-1">Description</label>
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full px-3 py-2 border border-accent-soft/30 rounded-lg text-sm text-graphite focus:outline-none focus:border-accent/50 resize-none" />
          </div>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-graphite/60 mb-1">Duration (min) *</label>
              <input type="number" required value={form.duration_minutes} onChange={e => setForm(f => ({ ...f, duration_minutes: e.target.value }))} className="w-full h-10 px-3 border border-accent-soft/30 rounded-lg text-sm text-graphite focus:outline-none focus:border-accent/50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-graphite/60 mb-1">Price ($) *</label>
              <input type="number" required step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="w-full h-10 px-3 border border-accent-soft/30 rounded-lg text-sm text-graphite focus:outline-none focus:border-accent/50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-graphite/60 mb-1">Buffer (min)</label>
              <input type="number" value={form.buffer_minutes} onChange={e => setForm(f => ({ ...f, buffer_minutes: e.target.value }))} className="w-full h-10 px-3 border border-accent-soft/30 rounded-lg text-sm text-graphite focus:outline-none focus:border-accent/50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-graphite/60 mb-1">Max/Day</label>
              <input type="number" value={form.max_per_day} onChange={e => setForm(f => ({ ...f, max_per_day: e.target.value }))} placeholder="No limit" className="w-full h-10 px-3 border border-accent-soft/30 rounded-lg text-sm text-graphite placeholder:text-graphite/60 focus:outline-none focus:border-accent/50" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-graphite">
            <input type="checkbox" checked={form.requires_consultation} onChange={e => setForm(f => ({ ...f, requires_consultation: e.target.checked }))} className="w-4 h-4 rounded border-accent-soft/30 text-accent" />
            Requires consultation
          </label>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={resetForm} className="h-9 px-4 text-sm text-graphite/60">Cancel</button>
            <button type="submit" disabled={saving} className="h-9 px-5 bg-mn-dark text-white text-sm font-medium rounded-full hover:bg-mn-dark/90 disabled:opacity-50">{saving ? 'Saving...' : editId ? 'Update' : 'Create'}</button>
          </div>
        </form>
      )}

      {/* Service List */}
      {loading ? (
        <div className="space-y-3 animate-pulse">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-accent-soft/10 rounded-xl" />)}</div>
      ) : services.length === 0 ? (
        <div className="bg-white rounded-xl border border-accent-soft/30 p-8 text-center">
          <Scissors className="w-10 h-10 text-accent-soft mx-auto mb-3" />
          <p className="text-sm text-graphite/60">No services configured yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {services.map(svc => (
            <div key={svc.id} className="bg-white rounded-xl border border-accent-soft/30 p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Scissors className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-graphite">{svc.name}</p>
                      {svc.category && <span className="text-[10px] bg-accent-soft/20 text-graphite/60 px-2 py-0.5 rounded-full">{svc.category}</span>}
                      {!svc.is_active && <span className="text-[10px] bg-red-50 text-red-700 px-2 py-0.5 rounded-full">Inactive</span>}
                    </div>
                    {svc.description && <p className="text-xs text-graphite/60 mt-0.5">{svc.description}</p>}
                    <div className="flex items-center gap-4 mt-2 text-xs text-graphite/60">
                      <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />${svc.price}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{svc.duration_minutes} min</span>
                      {svc.buffer_minutes > 0 && <span>+{svc.buffer_minutes} buffer</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setSelectedService(selectedService === svc.id ? null : svc.id)} className="w-8 h-8 rounded-full hover:bg-background flex items-center justify-center text-xs text-accent">Add-ons</button>
                  <button onClick={() => handleEdit(svc)} className="w-8 h-8 rounded-full hover:bg-background flex items-center justify-center"><Pencil className="w-3.5 h-3.5 text-graphite/60" /></button>
                  <button onClick={() => handleDelete(svc.id)} className="w-8 h-8 rounded-full hover:bg-red-50 flex items-center justify-center"><Trash2 className="w-3.5 h-3.5 text-signal-down" /></button>
                </div>
              </div>
              {selectedService === svc.id && <AddonPanel serviceId={svc.id} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AddonPanel({ serviceId }: { serviceId: string }) {
  const { addons, createAddon, deleteAddon } = useServiceAddons(serviceId);
  const [showAdd, setShowAdd] = useState(false);
  const [addonForm, setAddonForm] = useState({ name: '', description: '', price: '', duration_minutes: '15' });
  const [saving, setSaving] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: NewAddon = {
        service_id: serviceId,
        name: addonForm.name,
        description: addonForm.description || undefined,
        price: parseFloat(addonForm.price) || 0,
        duration_minutes: parseInt(addonForm.duration_minutes) || 15,
      };
      await createAddon(payload);
      setAddonForm({ name: '', description: '', price: '', duration_minutes: '15' });
      setShowAdd(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-accent-soft/10">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-graphite uppercase tracking-wider">Add-ons</span>
        <button onClick={() => setShowAdd(s => !s)} className="text-xs text-accent hover:text-accent-hover font-medium">
          {showAdd ? 'Cancel' : '+ Add'}
        </button>
      </div>
      {showAdd && (
        <form onSubmit={handleAdd} className="grid grid-cols-4 gap-2 mb-3">
          <input type="text" required value={addonForm.name} onChange={e => setAddonForm(f => ({ ...f, name: e.target.value }))} placeholder="Name" className="h-8 px-2 border border-accent-soft/30 rounded-lg text-xs text-graphite placeholder:text-graphite/60 focus:outline-none focus:border-accent/50" />
          <input type="number" required step="0.01" value={addonForm.price} onChange={e => setAddonForm(f => ({ ...f, price: e.target.value }))} placeholder="Price" className="h-8 px-2 border border-accent-soft/30 rounded-lg text-xs text-graphite placeholder:text-graphite/60 focus:outline-none focus:border-accent/50" />
          <input type="number" value={addonForm.duration_minutes} onChange={e => setAddonForm(f => ({ ...f, duration_minutes: e.target.value }))} placeholder="Minutes" className="h-8 px-2 border border-accent-soft/30 rounded-lg text-xs text-graphite placeholder:text-graphite/60 focus:outline-none focus:border-accent/50" />
          <button type="submit" disabled={saving} className="h-8 bg-mn-dark text-white text-xs rounded-full disabled:opacity-50">{saving ? '...' : 'Add'}</button>
        </form>
      )}
      {addons.length === 0 ? (
        <p className="text-xs text-graphite/60">No add-ons</p>
      ) : (
        <div className="space-y-1">
          {addons.map(a => (
            <div key={a.id} className="flex items-center justify-between py-1">
              <span className="text-xs text-graphite">{a.name} — ${a.price} ({a.duration_minutes} min)</span>
              <button onClick={() => deleteAddon(a.id)} className="text-xs text-signal-down hover:underline">Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
