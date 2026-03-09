import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { useCrmContactDetail, useCrmContacts, type NewContact } from '../../lib/useCrmContacts';

const TYPES = ['client', 'lead', 'vendor', 'partner', 'other'];
const LIFECYCLE_STAGES = ['lead', 'prospect', 'client', 'vip', 'inactive', 'churned'];
const CONTACT_METHODS = ['email', 'phone', 'sms', 'in_person'];

export default function EditContact() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { contact, loading: detailLoading } = useCrmContactDetail(id);
  const { updateContact, deleteContact } = useCrmContacts(profile?.business_id);
  const updateContactMutation = useMutation({
    mutationFn: async ({ contactId, updates }: { contactId: string; updates: Partial<NewContact> }) =>
      updateContact(contactId, updates),
  });
  const deleteContactMutation = useMutation({
    mutationFn: async (contactId: string) => deleteContact(contactId),
  });

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
    website_url: '',
    instagram_handle: '',
    facebook_handle: '',
    tiktok_handle: '',
    linkedin_url: '',
  });

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!contact) return;
    const metadata =
      contact.metadata && typeof contact.metadata === 'object' && !Array.isArray(contact.metadata)
        ? (contact.metadata as Record<string, unknown>)
        : {};
    const channels =
      metadata.contact_channels &&
      typeof metadata.contact_channels === 'object' &&
      !Array.isArray(metadata.contact_channels)
        ? (metadata.contact_channels as Record<string, unknown>)
        : {};

    setForm({
      type: contact.type,
      first_name: contact.first_name,
      last_name: contact.last_name,
      email: contact.email ?? '',
      phone: contact.phone ?? '',
      lifecycle_stage: contact.lifecycle_stage,
      source: contact.source ?? '',
      notes: contact.notes ?? '',
      skin_type: contact.skin_type ?? '',
      hair_type: contact.hair_type ?? '',
      allergies: contact.allergies?.join(', ') ?? '',
      sensitivities: contact.sensitivities?.join(', ') ?? '',
      preferred_contact_method: contact.preferred_contact_method ?? 'email',
      gdpr_consent: contact.gdpr_consent,
      website_url: typeof channels.website_url === 'string' ? channels.website_url : '',
      instagram_handle: typeof channels.instagram_handle === 'string' ? channels.instagram_handle : '',
      facebook_handle: typeof channels.facebook_handle === 'string' ? channels.facebook_handle : '',
      tiktok_handle: typeof channels.tiktok_handle === 'string' ? channels.tiktok_handle : '',
      linkedin_url: typeof channels.linkedin_url === 'string' ? channels.linkedin_url : '',
    });
  }, [contact]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (!form.first_name.trim() || !form.last_name.trim()) {
      setError('First and last name are required');
      return;
    }
    setError(null);
    try {
      const channelEntries = Object.entries({
        website_url: form.website_url.trim(),
        instagram_handle: form.instagram_handle.trim(),
        facebook_handle: form.facebook_handle.trim(),
        tiktok_handle: form.tiktok_handle.trim(),
        linkedin_url: form.linkedin_url.trim(),
      }).filter(([, value]) => value.length > 0);

      const existingMetadata =
        contact?.metadata && typeof contact.metadata === 'object' && !Array.isArray(contact.metadata)
          ? ({ ...contact.metadata } as Record<string, unknown>)
          : {};

      if (channelEntries.length > 0) {
        existingMetadata.contact_channels = Object.fromEntries(channelEntries);
      } else {
        delete existingMetadata.contact_channels;
      }

      const updates: Partial<NewContact> = {
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
        metadata: existingMetadata,
      };
      await updateContactMutation.mutateAsync({ contactId: id, updates });
      navigate(`/portal/crm/contacts/${id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update contact');
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteContactMutation.mutateAsync(id);
      navigate('/portal/crm/contacts');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete contact');
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

  if (!contact) {
    return (
      <div className="text-center py-12">
        <p className="text-graphite/60">Contact not found</p>
        <Link to="/portal/crm/contacts" className="text-accent text-sm mt-2 inline-block">Back to contacts</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center gap-3">
        <Link to={`/portal/crm/contacts/${id}`} className="w-8 h-8 rounded-full border border-accent-soft/30 flex items-center justify-center hover:border-accent/30 transition-colors">
          <ArrowLeft className="w-4 h-4 text-graphite/60" />
        </Link>
        <h1 className="text-xl font-semibold text-graphite flex-1">Edit Contact</h1>
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
          <p className="text-sm font-medium text-graphite mb-2">Delete this contact?</p>
          <p className="text-xs text-graphite/60 mb-4">This will permanently remove {contact.first_name} {contact.last_name} and all associated interactions. This action cannot be undone.</p>
          <div className="flex gap-2">
            <button onClick={() => setShowDeleteConfirm(false)} className="h-8 px-4 text-xs text-graphite/60 hover:text-graphite">Cancel</button>
            <button onClick={handleDelete} disabled={deleteContactMutation.isPending} className="h-8 px-4 bg-signal-down text-white text-xs font-medium rounded-full hover:bg-signal-down/90 disabled:opacity-50">
              {deleteContactMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-accent-soft/30 p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-graphite/60 mb-1.5">First Name *</label>
            <input type="text" value={form.first_name} onChange={set('first_name')} required className="w-full h-10 px-3 border border-accent-soft/30 rounded-lg text-sm text-graphite focus:outline-none focus:border-accent/50" />
          </div>
          <div>
            <label className="block text-xs font-medium text-graphite/60 mb-1.5">Last Name *</label>
            <input type="text" value={form.last_name} onChange={set('last_name')} required className="w-full h-10 px-3 border border-accent-soft/30 rounded-lg text-sm text-graphite focus:outline-none focus:border-accent/50" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-graphite/60 mb-1.5">Type</label>
            <select value={form.type} onChange={set('type')} className="w-full h-10 px-3 border border-accent-soft/30 rounded-lg text-sm text-graphite focus:outline-none focus:border-accent/50 bg-white">
              {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-graphite/60 mb-1.5">Lifecycle Stage</label>
            <select value={form.lifecycle_stage} onChange={set('lifecycle_stage')} className="w-full h-10 px-3 border border-accent-soft/30 rounded-lg text-sm text-graphite focus:outline-none focus:border-accent/50 bg-white">
              {LIFECYCLE_STAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-graphite/60 mb-1.5">Source</label>
            <input type="text" value={form.source} onChange={set('source')} placeholder="e.g., referral, walk-in, website" className="w-full h-10 px-3 border border-accent-soft/30 rounded-lg text-sm text-graphite placeholder:text-graphite/60 focus:outline-none focus:border-accent/50" />
          </div>
          <div>
            <label className="block text-xs font-medium text-graphite/60 mb-1.5">Preferred Contact Method</label>
            <select value={form.preferred_contact_method} onChange={set('preferred_contact_method')} className="w-full h-10 px-3 border border-accent-soft/30 rounded-lg text-sm text-graphite focus:outline-none focus:border-accent/50 bg-white">
              {CONTACT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        <div className="border-t border-accent-soft/20 pt-4">
          <h3 className="text-sm font-semibold text-graphite mb-3">Client Preferences</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-graphite/60 mb-1.5">Skin Type</label>
              <input type="text" value={form.skin_type} onChange={set('skin_type')} placeholder="e.g., oily, dry, combination" className="w-full h-10 px-3 border border-accent-soft/30 rounded-lg text-sm text-graphite placeholder:text-graphite/60 focus:outline-none focus:border-accent/50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-graphite/60 mb-1.5">Hair Type</label>
              <input type="text" value={form.hair_type} onChange={set('hair_type')} placeholder="e.g., fine, thick, curly" className="w-full h-10 px-3 border border-accent-soft/30 rounded-lg text-sm text-graphite placeholder:text-graphite/60 focus:outline-none focus:border-accent/50" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-xs font-medium text-graphite/60 mb-1.5">Allergies (comma-separated)</label>
              <input type="text" value={form.allergies} onChange={set('allergies')} placeholder="e.g., latex, fragrance" className="w-full h-10 px-3 border border-accent-soft/30 rounded-lg text-sm text-graphite placeholder:text-graphite/60 focus:outline-none focus:border-accent/50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-graphite/60 mb-1.5">Sensitivities (comma-separated)</label>
              <input type="text" value={form.sensitivities} onChange={set('sensitivities')} placeholder="e.g., retinol, AHA" className="w-full h-10 px-3 border border-accent-soft/30 rounded-lg text-sm text-graphite placeholder:text-graphite/60 focus:outline-none focus:border-accent/50" />
            </div>
          </div>
        </div>

        <div className="border-t border-accent-soft/20 pt-4">
          <h3 className="text-sm font-semibold text-graphite mb-3">Website + Social</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-graphite/60 mb-1.5">Website</label>
              <input type="url" value={form.website_url} onChange={set('website_url')} placeholder="https://example.com" className="w-full h-10 px-3 border border-accent-soft/30 rounded-lg text-sm text-graphite placeholder:text-graphite/60 focus:outline-none focus:border-accent/50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-graphite/60 mb-1.5">Instagram</label>
              <input type="text" value={form.instagram_handle} onChange={set('instagram_handle')} placeholder="@handle" className="w-full h-10 px-3 border border-accent-soft/30 rounded-lg text-sm text-graphite placeholder:text-graphite/60 focus:outline-none focus:border-accent/50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-graphite/60 mb-1.5">Facebook</label>
              <input type="text" value={form.facebook_handle} onChange={set('facebook_handle')} placeholder="facebook.com/page or @handle" className="w-full h-10 px-3 border border-accent-soft/30 rounded-lg text-sm text-graphite placeholder:text-graphite/60 focus:outline-none focus:border-accent/50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-graphite/60 mb-1.5">TikTok</label>
              <input type="text" value={form.tiktok_handle} onChange={set('tiktok_handle')} placeholder="@handle" className="w-full h-10 px-3 border border-accent-soft/30 rounded-lg text-sm text-graphite placeholder:text-graphite/60 focus:outline-none focus:border-accent/50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-graphite/60 mb-1.5">LinkedIn</label>
              <input type="url" value={form.linkedin_url} onChange={set('linkedin_url')} placeholder="https://linkedin.com/in/..." className="w-full h-10 px-3 border border-accent-soft/30 rounded-lg text-sm text-graphite placeholder:text-graphite/60 focus:outline-none focus:border-accent/50" />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-graphite/60 mb-1.5">Notes</label>
          <textarea value={form.notes} onChange={set('notes')} rows={3} className="w-full px-3 py-2 border border-accent-soft/30 rounded-lg text-sm text-graphite placeholder:text-graphite/60 focus:outline-none focus:border-accent/50 resize-none" />
        </div>

        <label className="flex items-center gap-2 text-sm text-graphite">
          <input type="checkbox" checked={form.gdpr_consent} onChange={e => setForm(f => ({ ...f, gdpr_consent: e.target.checked }))} className="w-4 h-4 rounded border-accent-soft/30 text-accent focus:ring-accent/50" />
          GDPR consent given
        </label>

        <div className="flex justify-end gap-3 pt-2">
          <Link to={`/portal/crm/contacts/${id}`} className="h-10 px-5 text-sm text-graphite/60 hover:text-graphite inline-flex items-center">Cancel</Link>
          <button type="submit" disabled={updateContactMutation.isPending} className="h-10 px-6 bg-mn-dark text-white text-sm font-medium rounded-full hover:bg-mn-dark/90 disabled:opacity-50 transition-colors inline-flex items-center gap-2">
            <Save className="w-4 h-4" />
            {updateContactMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
