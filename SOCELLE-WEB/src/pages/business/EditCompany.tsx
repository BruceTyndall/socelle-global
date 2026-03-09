import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useCrmCompanyDetail, useCrmCompanies, type NewCompany } from '../../lib/useCrmCompanies';

const TYPES = ['salon', 'spa', 'medspa', 'clinic', 'supplier', 'distributor', 'other'];

export default function EditCompany() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { company, loading: detailLoading } = useCrmCompanyDetail(id);
  const { updateCompany, deleteCompany } = useCrmCompanies(profile?.business_id);

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
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!company) return;
    setForm({
      name: company.name,
      type: company.type,
      industry: company.industry ?? '',
      website: company.website ?? '',
      phone: company.phone ?? '',
      email: company.email ?? '',
      address_line1: company.address_line1 ?? '',
      address_line2: company.address_line2 ?? '',
      city: company.city ?? '',
      state: company.state ?? '',
      zip: company.zip ?? '',
      country: company.country ?? 'US',
      notes: company.notes ?? '',
      annual_revenue: company.annual_revenue != null ? String(company.annual_revenue) : '',
      employee_count: company.employee_count != null ? String(company.employee_count) : '',
    });
  }, [company]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (!form.name.trim()) {
      setError('Company name is required');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const updates: Partial<NewCompany> = {
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
      await updateCompany(id, updates);
      navigate(`/portal/crm/companies/${id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update company');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await deleteCompany(id);
      navigate('/portal/crm/companies');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete company');
      setDeleting(false);
    }
  };

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  if (detailLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="h-6 bg-accent-soft/20 rounded w-48 animate-pulse" />
        <div className="bg-white rounded-xl border border-accent-soft/30 p-6 animate-pulse">
          <div className="h-64 bg-accent-soft/20 rounded" />
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-12">
        <p className="text-graphite/60">Company not found</p>
        <Link to="/portal/crm/companies" className="text-accent text-sm mt-2 inline-block">Back to companies</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link to={`/portal/crm/companies/${id}`} className="w-8 h-8 rounded-full border border-accent-soft/30 flex items-center justify-center hover:border-accent/30 transition-colors">
          <ArrowLeft className="w-4 h-4 text-graphite/60" />
        </Link>
        <h1 className="text-xl font-semibold text-graphite flex-1">Edit Company</h1>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="h-9 px-4 text-signal-down text-sm font-medium rounded-full border border-signal-down/30 hover:bg-signal-down/10 transition-colors inline-flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" /> Delete
        </button>
      </div>

      {error && (
        <div className="bg-signal-down/10 text-signal-down text-sm px-4 py-3 rounded-lg">{error}</div>
      )}

      {showDeleteConfirm && (
        <div className="bg-signal-down/5 border border-signal-down/20 rounded-xl p-5">
          <p className="text-sm font-medium text-graphite mb-2">Delete this company?</p>
          <p className="text-xs text-graphite/60 mb-4">This will permanently remove {company.name}. Contacts linked to this company will not be deleted but will lose their company association.</p>
          <div className="flex gap-2">
            <button onClick={() => setShowDeleteConfirm(false)} className="h-8 px-4 text-xs text-graphite/60 hover:text-graphite">Cancel</button>
            <button onClick={handleDelete} disabled={deleting} className="h-8 px-4 bg-signal-down text-white text-xs font-medium rounded-full hover:bg-signal-down/90 disabled:opacity-50">
              {deleting ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-accent-soft/30 p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-medium text-graphite/60 mb-1.5">Company Name *</label>
            <input type="text" value={form.name} onChange={set('name')} required className="w-full h-10 px-3 border border-accent-soft/30 rounded-lg text-sm text-graphite focus:outline-none focus:border-accent/50" />
          </div>
          <div>
            <label className="block text-xs font-medium text-graphite/60 mb-1.5">Type</label>
            <select value={form.type} onChange={set('type')} className="w-full h-10 px-3 border border-accent-soft/30 rounded-lg text-sm text-graphite focus:outline-none focus:border-accent/50 bg-white">
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-graphite/60 mb-1.5">Industry</label>
            <input type="text" value={form.industry} onChange={set('industry')} className="w-full h-10 px-3 border border-accent-soft/30 rounded-lg text-sm text-graphite focus:outline-none focus:border-accent/50" />
          </div>
          <div>
            <label className="block text-xs font-medium text-graphite/60 mb-1.5">Website</label>
            <input type="url" value={form.website} onChange={set('website')} className="w-full h-10 px-3 border border-accent-soft/30 rounded-lg text-sm text-graphite focus:outline-none focus:border-accent/50" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-graphite/60 mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={set('email')} className="w-full h-10 px-3 border border-accent-soft/30 rounded-lg text-sm text-graphite focus:outline-none focus:border-accent/50" />
          </div>
          <div>
            <label className="block text-xs font-medium text-graphite/60 mb-1.5">Phone</label>
            <input type="tel" value={form.phone} onChange={set('phone')} className="w-full h-10 px-3 border border-accent-soft/30 rounded-lg text-sm text-graphite focus:outline-none focus:border-accent/50" />
          </div>
        </div>

        <div className="border-t border-accent-soft/20 pt-4">
          <h3 className="text-sm font-semibold text-graphite mb-3">Address</h3>
          <div className="space-y-3">
            <input type="text" value={form.address_line1} onChange={set('address_line1')} placeholder="Address Line 1" className="w-full h-10 px-3 border border-accent-soft/30 rounded-lg text-sm text-graphite placeholder:text-graphite/60 focus:outline-none focus:border-accent/50" />
            <input type="text" value={form.address_line2} onChange={set('address_line2')} placeholder="Address Line 2" className="w-full h-10 px-3 border border-accent-soft/30 rounded-lg text-sm text-graphite placeholder:text-graphite/60 focus:outline-none focus:border-accent/50" />
            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-2">
                <input type="text" value={form.city} onChange={set('city')} placeholder="City" className="w-full h-10 px-3 border border-accent-soft/30 rounded-lg text-sm text-graphite placeholder:text-graphite/60 focus:outline-none focus:border-accent/50" />
              </div>
              <input type="text" value={form.state} onChange={set('state')} placeholder="State" className="w-full h-10 px-3 border border-accent-soft/30 rounded-lg text-sm text-graphite placeholder:text-graphite/60 focus:outline-none focus:border-accent/50" />
              <input type="text" value={form.zip} onChange={set('zip')} placeholder="ZIP" className="w-full h-10 px-3 border border-accent-soft/30 rounded-lg text-sm text-graphite placeholder:text-graphite/60 focus:outline-none focus:border-accent/50" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-graphite/60 mb-1.5">Annual Revenue ($)</label>
            <input type="number" value={form.annual_revenue} onChange={set('annual_revenue')} className="w-full h-10 px-3 border border-accent-soft/30 rounded-lg text-sm text-graphite focus:outline-none focus:border-accent/50" />
          </div>
          <div>
            <label className="block text-xs font-medium text-graphite/60 mb-1.5">Employee Count</label>
            <input type="number" value={form.employee_count} onChange={set('employee_count')} className="w-full h-10 px-3 border border-accent-soft/30 rounded-lg text-sm text-graphite focus:outline-none focus:border-accent/50" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-graphite/60 mb-1.5">Notes</label>
          <textarea value={form.notes} onChange={set('notes')} rows={3} className="w-full px-3 py-2 border border-accent-soft/30 rounded-lg text-sm text-graphite focus:outline-none focus:border-accent/50 resize-none" />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link to={`/portal/crm/companies/${id}`} className="h-10 px-5 text-sm text-graphite/60 hover:text-graphite inline-flex items-center">Cancel</Link>
          <button type="submit" disabled={saving} className="h-10 px-6 bg-mn-dark text-white text-sm font-medium rounded-full hover:bg-mn-dark/90 disabled:opacity-50 transition-colors inline-flex items-center gap-2">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
