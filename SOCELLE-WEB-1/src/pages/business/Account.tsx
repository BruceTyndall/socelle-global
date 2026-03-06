import { useEffect, useState } from 'react';
import { User, Check, CheckCircle, Clock, AlertCircle, Globe, Instagram, Phone, MapPin, Building2 } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';

const BUSINESS_TYPES = [
  { value: 'salon',    label: 'Salon' },
  { value: 'spa',      label: 'Spa' },
  { value: 'medspa',   label: 'Med Spa' },
  { value: 'retail',   label: 'Retail' },
  { value: 'other',    label: 'Other' },
];

interface BusinessData {
  name: string;
  type: string;
  city: string;
  state: string;
  phone: string;
  website_url: string;
  instagram_handle: string;
  verification_status: string;
}

const EMPTY_BUSINESS: BusinessData = {
  name: '',
  type: 'spa',
  city: '',
  state: '',
  phone: '',
  website_url: '',
  instagram_handle: '',
  verification_status: 'unverified',
};

function VerificationBadge({ status }: { status: string }) {
  if (status === 'verified') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold font-sans">
        <CheckCircle className="w-3.5 h-3.5" />
        Verified
      </span>
    );
  }
  if (status === 'pending_verification' || status === 'pending_claim') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold font-sans">
        <Clock className="w-3.5 h-3.5" />
        Verification pending
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pro-stone/40 border border-pro-stone text-pro-warm-gray text-xs font-semibold font-sans">
      <AlertCircle className="w-3.5 h-3.5" />
      Unverified
    </span>
  );
}

export default function BusinessAccount() {
  const { user, profile } = useAuth();

  const [business, setBusiness] = useState<BusinessData>(EMPTY_BUSINESS);
  const [form, setForm]         = useState<BusinessData>(EMPTY_BUSINESS);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [error, setError]       = useState<string | null>(null);

  // ── Fetch business record ──────────────────────────────────────────────────
  useEffect(() => {
    if (!profile?.business_id) { setLoading(false); return; }
    fetchBusiness();
  }, [profile?.business_id]);

  const fetchBusiness = async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('businesses')
      .select('name, type, city, state, phone, website_url, instagram_handle, verification_status')
      .eq('id', profile!.business_id)
      .single();

    if (err || !data) {
      setError('Could not load business profile.');
      setLoading(false);
      return;
    }

    const biz: BusinessData = {
      name:               data.name               || '',
      type:               data.type               || 'spa',
      city:               data.city               || '',
      state:              data.state              || '',
      phone:              data.phone              || '',
      website_url:        data.website_url        || '',
      instagram_handle:   data.instagram_handle   || '',
      verification_status: data.verification_status || 'unverified',
    };
    setBusiness(biz);
    setForm(biz);
    setLoading(false);
  };

  // ── Field helper ───────────────────────────────────────────────────────────
  const set = (field: keyof BusinessData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  // ── Dirty check ───────────────────────────────────────────────────────────
  const isDirty =
    form.name             !== business.name             ||
    form.type             !== business.type             ||
    form.city             !== business.city             ||
    form.state            !== business.state            ||
    form.phone            !== business.phone            ||
    form.website_url      !== business.website_url      ||
    form.instagram_handle !== business.instagram_handle;

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!user || !profile?.business_id || !form.name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const { error: bizErr } = await supabase
        .from('businesses')
        .update({
          name:             form.name.trim(),
          type:             form.type,
          city:             form.city.trim(),
          state:            form.state.trim(),
          phone:            form.phone.trim(),
          website_url:      form.website_url.trim(),
          instagram_handle: form.instagram_handle.replace(/^@/, '').trim(),
        })
        .eq('id', profile.business_id);

      if (bizErr) throw bizErr;

      // Keep sidebar display name in sync
      await supabase
        .from('user_profiles')
        .update({ spa_name: form.name.trim() })
        .eq('id', user.id);

      const updated = { ...form, name: form.name.trim(), instagram_handle: form.instagram_handle.replace(/^@/, '').trim() };
      setBusiness(updated);
      setForm(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="animate-pulse space-y-3">
          <div className="h-7 bg-pro-stone/30 rounded w-32" />
          <div className="h-4 bg-pro-stone/30 rounded w-48" />
        </div>
        <div className="bg-white rounded-xl border border-pro-stone p-6 animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-pro-stone/20 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // ── No business linked ─────────────────────────────────────────────────────
  if (!profile?.business_id) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl border border-pro-stone p-8 text-center">
          <Building2 className="w-10 h-10 text-pro-stone mx-auto mb-3" />
          <p className="text-sm font-semibold text-pro-charcoal font-sans">No business profile linked</p>
          <p className="text-xs text-pro-warm-gray font-sans mt-1">Contact support to link your business account.</p>
        </div>
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* ── Page header ── */}
      <div>
        <h1 className="text-2xl font-sans font-semibold text-pro-charcoal tracking-tight">Account</h1>
        <p className="text-sm text-pro-warm-gray font-sans mt-1">Manage your business profile</p>
      </div>

      {/* ── Identity card ── */}
      <div className="bg-white rounded-xl border border-pro-stone overflow-hidden">
        <div className="px-6 pt-5 pb-4 border-b border-pro-stone flex items-center justify-between">
          <p className="text-xs font-sans font-semibold text-pro-warm-gray uppercase tracking-wider">Business profile</p>
          <VerificationBadge status={business.verification_status} />
        </div>

        <div className="px-6 pt-5 pb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-pro-charcoal flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-pro-charcoal font-sans">
                {business.name || 'Your Business'}
              </p>
              <p className="text-xs text-pro-warm-gray font-sans">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 pt-4 space-y-4">

          {/* Business name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold font-sans text-pro-charcoal">
              Business name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={set('name')}
              placeholder="Your salon or spa name"
              className="w-full px-4 py-2.5 rounded-lg border border-pro-stone text-sm font-sans text-pro-charcoal placeholder:text-pro-stone focus:outline-none focus:ring-2 focus:ring-pro-charcoal/20"
            />
          </div>

          {/* Business type */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold font-sans text-pro-charcoal">
              Business type
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pro-warm-gray pointer-events-none" />
              <select
                value={form.type}
                onChange={set('type')}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-pro-stone text-sm font-sans text-pro-charcoal bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-pro-charcoal/20"
              >
                {BUSINESS_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* City + State */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold font-sans text-pro-charcoal">City</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pro-warm-gray pointer-events-none" />
                <input
                  type="text"
                  value={form.city}
                  onChange={set('city')}
                  placeholder="Los Angeles"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-pro-stone text-sm font-sans text-pro-charcoal placeholder:text-pro-stone focus:outline-none focus:ring-2 focus:ring-pro-charcoal/20"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold font-sans text-pro-charcoal">State</label>
              <input
                type="text"
                value={form.state}
                onChange={set('state')}
                placeholder="CA"
                maxLength={2}
                className="w-full px-4 py-2.5 rounded-lg border border-pro-stone text-sm font-sans text-pro-charcoal placeholder:text-pro-stone focus:outline-none focus:ring-2 focus:ring-pro-charcoal/20 uppercase"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold font-sans text-pro-charcoal">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pro-warm-gray pointer-events-none" />
              <input
                type="tel"
                value={form.phone}
                onChange={set('phone')}
                placeholder="+1 (555) 000-0000"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-pro-stone text-sm font-sans text-pro-charcoal placeholder:text-pro-stone focus:outline-none focus:ring-2 focus:ring-pro-charcoal/20"
              />
            </div>
          </div>

          {/* Website */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold font-sans text-pro-charcoal">Website</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pro-warm-gray pointer-events-none" />
              <input
                type="url"
                value={form.website_url}
                onChange={set('website_url')}
                placeholder="https://yourspa.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-pro-stone text-sm font-sans text-pro-charcoal placeholder:text-pro-stone focus:outline-none focus:ring-2 focus:ring-pro-charcoal/20"
              />
            </div>
          </div>

          {/* Instagram */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold font-sans text-pro-charcoal">Instagram</label>
            <div className="relative">
              <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pro-warm-gray pointer-events-none" />
              <input
                type="text"
                value={form.instagram_handle}
                onChange={set('instagram_handle')}
                placeholder="@yourspa"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-pro-stone text-sm font-sans text-pro-charcoal placeholder:text-pro-stone focus:outline-none focus:ring-2 focus:ring-pro-charcoal/20"
              />
            </div>
          </div>

          {/* Email (read-only) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold font-sans text-pro-charcoal">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-2.5 rounded-lg border border-pro-stone/60 text-sm font-sans text-pro-warm-gray bg-pro-ivory cursor-not-allowed"
            />
            <p className="text-xs text-pro-warm-gray font-sans">
              Email is managed through your login credentials
            </p>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-500 font-sans">{error}</p>
          )}

          {/* Save row */}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={handleSave}
              disabled={saving || !form.name.trim() || !isDirty}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-pro-charcoal hover:bg-pro-charcoal/90 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium font-sans rounded-lg transition-colors"
            >
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm text-emerald-600 font-sans">
                <Check className="w-3.5 h-3.5" />
                Saved
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Verification info ── */}
      {business.verification_status !== 'verified' && (
        <div className="bg-pro-ivory rounded-xl border border-pro-stone px-6 py-5">
          <p className="text-sm font-semibold text-pro-charcoal font-sans mb-1">
            Get verified to unlock brand relationships
          </p>
          <p className="text-xs text-pro-warm-gray font-sans leading-relaxed">
            Verified businesses can connect directly with brands, access wholesale pricing, and place orders.
            Verification is manual — our team reviews your business license. Contact{' '}
            <a href="mailto:support@socelle.com" className="text-pro-navy underline">support@socelle.com</a>{' '}
            to start the process.
          </p>
        </div>
      )}

    </div>
  );
}
