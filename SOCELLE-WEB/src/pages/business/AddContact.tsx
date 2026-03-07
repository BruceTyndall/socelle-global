import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { useCrmContacts, type NewContact } from '../../lib/useCrmContacts';

const TYPES = ['client', 'lead', 'vendor', 'partner', 'other'];
const LIFECYCLE_STAGES = ['lead', 'prospect', 'client', 'vip', 'inactive', 'churned'];
const CONTACT_METHODS = ['email', 'phone', 'sms', 'in_person'];

export default function AddContact() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { createContact } = useCrmContacts(profile?.business_id);

  const [form, setForm] = useState({
    type: 'client',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    lifecycle_stage: 'lead',
    source: '',
    notes: '',
    skin_type: '',
    hair_type: '',
    allergies: '',
    sensitivities: '',
    preferred_contact_method: 'email',
    gdpr_consent: false,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.business_id) return;
    if (!form.first_name.trim() || !form.last_name.trim()) {
      setError('First and last name are required');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload: NewContact = {
        business_id: profile.business_id,
        type: form.type,
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        lifecycle_stage: form.lifecycle_stage,
        source: form.source.trim() || undefined,
        notes: form.notes.trim() || undefined,
        skin_type: form.skin_type.trim() || undefined,
        hair_type: form.hair_type.trim() || undefined,
        allergies: form.allergies ? form.allergies.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        sensitivities: form.sensitivities ? form.sensitivities.split(',').map(s => s.trim()).filter(Boolean) : undefined,
        preferred_contact_method: form.preferred_contact_method,
        gdpr_consent: form.gdpr_consent,
      };
      await createContact(payload);
      navigate('/portal/crm/contacts');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to create contact');
    } finally {
      setSaving(false);
    }
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/portal/crm/contacts" className="w-8 h-8 rounded-full border border-pro-stone/30 flex items-center justify-center hover:border-accent/30 transition-colors">
          <ArrowLeft className="w-4 h-4 text-pro-warm-gray" />
        </Link>
        <h1 className="text-xl font-semibold text-pro-charcoal">Add Contact</h1>
      </div>

      {error && (
        <div className="bg-signal-down/10 text-signal-down text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-pro-stone/30 p-6 space-y-5">
        {/* Name */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-pro-warm-gray mb-1.5">First Name *</label>
            <input type="text" value={form.first_name} onChange={set('first_name')} required className="w-full h-10 px-3 border border-pro-stone/30 rounded-lg text-sm text-pro-charcoal focus:outline-none focus:border-accent/50" />
          </div>
          <div>
            <label className="block text-xs font-medium text-pro-warm-gray mb-1.5">Last Name *</label>
            <input type="text" value={form.last_name} onChange={set('last_name')} required className="w-full h-10 px-3 border border-pro-stone/30 rounded-lg text-sm text-pro-charcoal focus:outline-none focus:border-accent/50" />
          </div>
        </div>

        {/* Type + Lifecycle */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-pro-warm-gray mb-1.5">Type</label>
            <select value={form.type} onChange={set('type')} className="w-full h-10 px-3 border border-pro-stone/30 rounded-lg text-sm text-pro-charcoal focus:outline-none focus:border-accent/50 bg-white">
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-pro-warm-gray mb-1.5">Lifecycle Stage</label>
            <select value={form.lifecycle_stage} onChange={set('lifecycle_stage')} className="w-full h-10 px-3 border border-pro-stone/30 rounded-lg text-sm text-pro-charcoal focus:outline-none focus:border-accent/50 bg-white">
              {LIFECYCLE_STAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        {/* Contact Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-pro-warm-gray mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={set('email')} className="w-full h-10 px-3 border border-pro-stone/30 rounded-lg text-sm text-pro-charcoal focus:outline-none focus:border-accent/50" />
          </div>
          <div>
            <label className="block text-xs font-medium text-pro-warm-gray mb-1.5">Phone</label>
            <input type="tel" value={form.phone} onChange={set('phone')} className="w-full h-10 px-3 border border-pro-stone/30 rounded-lg text-sm text-pro-charcoal focus:outline-none focus:border-accent/50" />
          </div>
        </div>

        {/* Source + Contact Method */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-pro-warm-gray mb-1.5">Source</label>
            <input type="text" value={form.source} onChange={set('source')} placeholder="e.g., referral, walk-in, website" className="w-full h-10 px-3 border border-pro-stone/30 rounded-lg text-sm text-pro-charcoal placeholder:text-pro-warm-gray focus:outline-none focus:border-accent/50" />
          </div>
          <div>
            <label className="block text-xs font-medium text-pro-warm-gray mb-1.5">Preferred Contact Method</label>
            <select value={form.preferred_contact_method} onChange={set('preferred_contact_method')} className="w-full h-10 px-3 border border-pro-stone/30 rounded-lg text-sm text-pro-charcoal focus:outline-none focus:border-accent/50 bg-white">
              {CONTACT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        {/* Preferences */}
        <div className="border-t border-pro-stone/20 pt-4">
          <h3 className="text-sm font-semibold text-pro-charcoal mb-3">Client Preferences</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-pro-warm-gray mb-1.5">Skin Type</label>
              <input type="text" value={form.skin_type} onChange={set('skin_type')} placeholder="e.g., oily, dry, combination" className="w-full h-10 px-3 border border-pro-stone/30 rounded-lg text-sm text-pro-charcoal placeholder:text-pro-warm-gray focus:outline-none focus:border-accent/50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-pro-warm-gray mb-1.5">Hair Type</label>
              <input type="text" value={form.hair_type} onChange={set('hair_type')} placeholder="e.g., fine, thick, curly" className="w-full h-10 px-3 border border-pro-stone/30 rounded-lg text-sm text-pro-charcoal placeholder:text-pro-warm-gray focus:outline-none focus:border-accent/50" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-xs font-medium text-pro-warm-gray mb-1.5">Allergies (comma-separated)</label>
              <input type="text" value={form.allergies} onChange={set('allergies')} placeholder="e.g., latex, fragrance" className="w-full h-10 px-3 border border-pro-stone/30 rounded-lg text-sm text-pro-charcoal placeholder:text-pro-warm-gray focus:outline-none focus:border-accent/50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-pro-warm-gray mb-1.5">Sensitivities (comma-separated)</label>
              <input type="text" value={form.sensitivities} onChange={set('sensitivities')} placeholder="e.g., retinol, AHA" className="w-full h-10 px-3 border border-pro-stone/30 rounded-lg text-sm text-pro-charcoal placeholder:text-pro-warm-gray focus:outline-none focus:border-accent/50" />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-medium text-pro-warm-gray mb-1.5">Notes</label>
          <textarea value={form.notes} onChange={set('notes')} rows={3} className="w-full px-3 py-2 border border-pro-stone/30 rounded-lg text-sm text-pro-charcoal placeholder:text-pro-warm-gray focus:outline-none focus:border-accent/50 resize-none" />
        </div>

        {/* GDPR */}
        <label className="flex items-center gap-2 text-sm text-pro-charcoal">
          <input type="checkbox" checked={form.gdpr_consent} onChange={e => setForm(f => ({ ...f, gdpr_consent: e.target.checked }))} className="w-4 h-4 rounded border-pro-stone/30 text-accent focus:ring-accent/50" />
          GDPR consent given
        </label>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2">
          <Link to="/portal/crm/contacts" className="h-10 px-5 text-sm text-pro-warm-gray hover:text-pro-charcoal inline-flex items-center">Cancel</Link>
          <button type="submit" disabled={saving} className="h-10 px-6 bg-mn-dark text-white text-sm font-medium rounded-full hover:bg-mn-dark/90 disabled:opacity-50 transition-colors inline-flex items-center gap-2">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Contact'}
          </button>
        </div>
      </form>
    </div>
  );
}
