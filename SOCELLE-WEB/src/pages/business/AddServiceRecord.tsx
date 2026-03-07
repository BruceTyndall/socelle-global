import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Camera } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useClientTreatmentRecords, type NewTreatmentRecord } from '../../lib/useClientRecords';
import { useCrmContactDetail } from '../../lib/useCrmContacts';

export default function AddServiceRecord() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { contact } = useCrmContactDetail(id);
  const { createRecord } = useClientTreatmentRecords(id);

  const [form, setForm] = useState({
    service_name: '',
    products_used: '',
    formula: '',
    notes: '',
    before_photo_url: '',
    after_photo_url: '',
    follow_up_date: '',
    performed_by: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !profile?.business_id) return;
    if (!form.service_name.trim()) {
      setError('Service name is required');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload: NewTreatmentRecord = {
        contact_id: id,
        business_id: profile.business_id,
        service_name: form.service_name.trim(),
        products_used: form.products_used ? form.products_used.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        formula: form.formula.trim() || undefined,
        notes: form.notes.trim() || undefined,
        before_photo_url: form.before_photo_url.trim() || undefined,
        after_photo_url: form.after_photo_url.trim() || undefined,
        follow_up_date: form.follow_up_date || undefined,
        performed_by: form.performed_by.trim() || undefined,
      };
      await createRecord(payload);
      navigate(`/portal/crm/contacts/${id}/records`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to save record');
    } finally {
      setSaving(false);
    }
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link to={`/portal/crm/contacts/${id}/records`} className="w-8 h-8 rounded-full border border-pro-stone/30 flex items-center justify-center hover:border-accent/30 transition-colors">
          <ArrowLeft className="w-4 h-4 text-pro-warm-gray" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-pro-charcoal">Add Service Record</h1>
          {contact && <p className="text-sm text-pro-warm-gray">{contact.first_name} {contact.last_name}</p>}
        </div>
      </div>

      {error && <div className="bg-signal-down/10 text-signal-down text-sm px-4 py-3 rounded-lg">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-pro-stone/30 p-6 space-y-5">
        <div>
          <label className="block text-xs font-medium text-pro-warm-gray mb-1.5">Service Name *</label>
          <input type="text" required value={form.service_name} onChange={set('service_name')} placeholder="e.g., Chemical Peel, HydraFacial" className="w-full h-10 px-3 border border-pro-stone/30 rounded-lg text-sm text-pro-charcoal placeholder:text-pro-warm-gray focus:outline-none focus:border-accent/50" />
        </div>

        <div>
          <label className="block text-xs font-medium text-pro-warm-gray mb-1.5">Products Used (comma-separated)</label>
          <input type="text" value={form.products_used} onChange={set('products_used')} placeholder="e.g., SkinCeuticals C E Ferulic, Obagi Retinol" className="w-full h-10 px-3 border border-pro-stone/30 rounded-lg text-sm text-pro-charcoal placeholder:text-pro-warm-gray focus:outline-none focus:border-accent/50" />
        </div>

        <div>
          <label className="block text-xs font-medium text-pro-warm-gray mb-1.5">Formula / Mix</label>
          <textarea value={form.formula} onChange={set('formula')} rows={2} placeholder="e.g., 30% glycolic + 10% lactic, 3 min application" className="w-full px-3 py-2 border border-pro-stone/30 rounded-lg text-sm text-pro-charcoal placeholder:text-pro-warm-gray focus:outline-none focus:border-accent/50 resize-none" />
        </div>

        <div>
          <label className="block text-xs font-medium text-pro-warm-gray mb-1.5">Notes</label>
          <textarea value={form.notes} onChange={set('notes')} rows={3} placeholder="Client response, observations, follow-up instructions..." className="w-full px-3 py-2 border border-pro-stone/30 rounded-lg text-sm text-pro-charcoal placeholder:text-pro-warm-gray focus:outline-none focus:border-accent/50 resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-pro-warm-gray mb-1.5">Performed By</label>
            <input type="text" value={form.performed_by} onChange={set('performed_by')} placeholder="Staff name" className="w-full h-10 px-3 border border-pro-stone/30 rounded-lg text-sm text-pro-charcoal placeholder:text-pro-warm-gray focus:outline-none focus:border-accent/50" />
          </div>
          <div>
            <label className="block text-xs font-medium text-pro-warm-gray mb-1.5">Follow-up Date</label>
            <input type="date" value={form.follow_up_date} onChange={set('follow_up_date')} className="w-full h-10 px-3 border border-pro-stone/30 rounded-lg text-sm text-pro-charcoal focus:outline-none focus:border-accent/50" />
          </div>
        </div>

        {/* Photo URLs */}
        <div className="border-t border-pro-stone/20 pt-4">
          <h3 className="text-sm font-semibold text-pro-charcoal mb-3 flex items-center gap-2"><Camera className="w-4 h-4" /> Before/After Photos</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-pro-warm-gray mb-1.5">Before Photo URL</label>
              <input type="url" value={form.before_photo_url} onChange={set('before_photo_url')} placeholder="https://..." className="w-full h-10 px-3 border border-pro-stone/30 rounded-lg text-sm text-pro-charcoal placeholder:text-pro-warm-gray focus:outline-none focus:border-accent/50" />
              {form.before_photo_url && <img src={form.before_photo_url} alt="Before preview" className="w-full h-24 object-cover rounded-lg border border-pro-stone/20 mt-2" />}
            </div>
            <div>
              <label className="block text-xs font-medium text-pro-warm-gray mb-1.5">After Photo URL</label>
              <input type="url" value={form.after_photo_url} onChange={set('after_photo_url')} placeholder="https://..." className="w-full h-10 px-3 border border-pro-stone/30 rounded-lg text-sm text-pro-charcoal placeholder:text-pro-warm-gray focus:outline-none focus:border-accent/50" />
              {form.after_photo_url && <img src={form.after_photo_url} alt="After preview" className="w-full h-24 object-cover rounded-lg border border-pro-stone/20 mt-2" />}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link to={`/portal/crm/contacts/${id}/records`} className="h-10 px-5 text-sm text-pro-warm-gray hover:text-pro-charcoal inline-flex items-center">Cancel</Link>
          <button type="submit" disabled={saving} className="h-10 px-6 bg-mn-dark text-white text-sm font-medium rounded-full hover:bg-mn-dark/90 disabled:opacity-50 transition-colors inline-flex items-center gap-2">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Record'}
          </button>
        </div>
      </form>
    </div>
  );
}
