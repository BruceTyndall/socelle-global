import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useCrmCompanies, type NewCompany } from '../../lib/useCrmCompanies';

const TYPES = ['salon', 'spa', 'medspa', 'clinic', 'supplier', 'distributor', 'other'];

export default function AddCompany() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { createCompany } = useCrmCompanies(profile?.business_id);

  const [form, setForm] = useState({
    name: '',
    type: 'salon',
    industry: '',
    website: '',
    phone: '',
    email: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
    notes: '',
    annual_revenue: '',
    employee_count: '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.business_id) return;
    if (!form.name.trim()) {
      setError('Company name is required');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload: NewCompany = {
        business_id: profile.business_id,
        name: form.name.trim(),
        type: form.type,
        industry: form.industry.trim() || undefined,
        website: form.website.trim() || undefined,
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        address_line1: form.address_line1.trim() || undefined,
        address_line2: form.address_line2.trim() || undefined,
        city: form.city.trim() || undefined,
        state: form.state.trim() || undefined,
        zip: form.zip.trim() || undefined,
        country: form.country.trim() || undefined,
        notes: form.notes.trim() || undefined,
        annual_revenue: form.annual_revenue ? parseFloat(form.annual_revenue) : undefined,
        employee_count: form.employee_count ? parseInt(form.employee_count, 10) : undefined,
      };
      await createCompany(payload);
      navigate('/portal/crm/companies');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create company');
    } finally {
      setSaving(false);
    }
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link to="/portal/crm/companies" className="w-8 h-8 rounded-full border border-pro-stone/30 flex items-center justify-center hover:border-accent/30 transition-colors">
          <ArrowLeft className="w-4 h-4 text-pro-warm-gray" />
        </Link>
        <h1 className="text-xl font-semibold text-pro-charcoal">Add Company</h1>
      </div>

      {error && (
        <div className="bg-signal-down/10 text-signal-down text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-pro-stone/30 p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-medium text-pro-warm-gray mb-1.5">Company Name *</label>
            <input type="text" value={form.name} onChange={set('name')} required className="w-full h-10 px-3 border border-pro-stone/30 rounded-lg text-sm text-pro-charcoal focus:outline-none focus:border-accent/50" />
          </div>
          <div>
            <label className="block text-xs font-medium text-pro-warm-gray mb-1.5">Type</label>
            <select value={form.type} onChange={set('type')} className="w-full h-10 px-3 border border-pro-stone/30 rounded-lg text-sm text-pro-charcoal focus:outline-none focus:border-accent/50 bg-white">
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-pro-warm-gray mb-1.5">Industry</label>
            <input type="text" value={form.industry} onChange={set('industry')} placeholder="e.g., Beauty, Wellness, Healthcare" className="w-full h-10 px-3 border border-pro-stone/30 rounded-lg text-sm text-pro-charcoal placeholder:text-pro-warm-gray focus:outline-none focus:border-accent/50" />
          </div>
          <div>
            <label className="block text-xs font-medium text-pro-warm-gray mb-1.5">Website</label>
            <input type="url" value={form.website} onChange={set('website')} placeholder="https://..." className="w-full h-10 px-3 border border-pro-stone/30 rounded-lg text-sm text-pro-charcoal placeholder:text-pro-warm-gray focus:outline-none focus:border-accent/50" />
          </div>
        </div>

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

        <div className="border-t border-pro-stone/20 pt-4">
          <h3 className="text-sm font-semibold text-pro-charcoal mb-3">Address</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-pro-warm-gray mb-1.5">Address Line 1</label>
              <input type="text" value={form.address_line1} onChange={set('address_line1')} className="w-full h-10 px-3 border border-pro-stone/30 rounded-lg text-sm text-pro-charcoal focus:outline-none focus:border-accent/50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-pro-warm-gray mb-1.5">Address Line 2</label>
              <input type="text" value={form.address_line2} onChange={set('address_line2')} className="w-full h-10 px-3 border border-pro-stone/30 rounded-lg text-sm text-pro-charcoal focus:outline-none focus:border-accent/50" />
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-pro-warm-gray mb-1.5">City</label>
                <input type="text" value={form.city} onChange={set('city')} className="w-full h-10 px-3 border border-pro-stone/30 rounded-lg text-sm text-pro-charcoal focus:outline-none focus:border-accent/50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-pro-warm-gray mb-1.5">State</label>
                <input type="text" value={form.state} onChange={set('state')} className="w-full h-10 px-3 border border-pro-stone/30 rounded-lg text-sm text-pro-charcoal focus:outline-none focus:border-accent/50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-pro-warm-gray mb-1.5">ZIP</label>
                <input type="text" value={form.zip} onChange={set('zip')} className="w-full h-10 px-3 border border-pro-stone/30 rounded-lg text-sm text-pro-charcoal focus:outline-none focus:border-accent/50" />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-pro-stone/20 pt-4">
          <h3 className="text-sm font-semibold text-pro-charcoal mb-3">Business Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-pro-warm-gray mb-1.5">Annual Revenue ($)</label>
              <input type="number" value={form.annual_revenue} onChange={set('annual_revenue')} placeholder="0" className="w-full h-10 px-3 border border-pro-stone/30 rounded-lg text-sm text-pro-charcoal placeholder:text-pro-warm-gray focus:outline-none focus:border-accent/50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-pro-warm-gray mb-1.5">Employee Count</label>
              <input type="number" value={form.employee_count} onChange={set('employee_count')} placeholder="0" className="w-full h-10 px-3 border border-pro-stone/30 rounded-lg text-sm text-pro-charcoal placeholder:text-pro-warm-gray focus:outline-none focus:border-accent/50" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-pro-warm-gray mb-1.5">Notes</label>
          <textarea value={form.notes} onChange={set('notes')} rows={3} className="w-full px-3 py-2 border border-pro-stone/30 rounded-lg text-sm text-pro-charcoal placeholder:text-pro-warm-gray focus:outline-none focus:border-accent/50 resize-none" />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link to="/portal/crm/companies" className="h-10 px-5 text-sm text-pro-warm-gray hover:text-pro-charcoal inline-flex items-center">Cancel</Link>
          <button type="submit" disabled={saving} className="h-10 px-6 bg-mn-dark text-white text-sm font-medium rounded-full hover:bg-mn-dark/90 disabled:opacity-50 transition-colors inline-flex items-center gap-2">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Company'}
          </button>
        </div>
      </form>
    </div>
  );
}
