import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Check, CheckCircle, Clock, AlertCircle, Globe, Instagram, Phone, MapPin, Building2, Bookmark, Heart } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSignalLibrary } from '../../lib/intelligence/useSignalEngagement';

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

function timeAgo(dateStr?: string | null): string {
  if (!dateStr) return 'Recently saved';
  const diff = Date.now() - new Date(dateStr).getTime();
  if (!Number.isFinite(diff) || diff < 0) return 'Recently saved';
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function humanizeSignalType(value?: string | null): string {
  if (!value) return 'Signal';
  return value
    .split('_')
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

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
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-soft/40 border border-accent-soft text-graphite/60 text-xs font-semibold font-sans">
      <AlertCircle className="w-3.5 h-3.5" />
      Unverified
    </span>
  );
}

export default function BusinessAccount() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const { data: signalLibrary, isLoading: libraryLoading } = useSignalLibrary(6);

  const [form, setForm]         = useState<BusinessData>(EMPTY_BUSINESS);
  const [saved, setSaved]       = useState(false);
  const [formInitialized, setFormInitialized] = useState(false);

  const { data: business = EMPTY_BUSINESS, isLoading: loading, error: queryError } = useQuery({
    queryKey: ['business-account', profile?.business_id],
    queryFn: async () => {
      const { data, error: err } = await supabase
        .from('businesses')
        .select('name, type, city, state, phone, website_url, instagram_handle, verification_status')
        .eq('id', profile!.business_id)
        .single();

      if (err || !data) throw new Error('Could not load business profile.');

      return {
        name:               data.name               || '',
        type:               data.type               || 'spa',
        city:               data.city               || '',
        state:              data.state              || '',
        phone:              data.phone              || '',
        website_url:        data.website_url        || '',
        instagram_handle:   data.instagram_handle   || '',
        verification_status: data.verification_status || 'unverified',
      } as BusinessData;
    },
    enabled: !!profile?.business_id,
  });

  // Sync form state when business data loads or changes
  if (business !== EMPTY_BUSINESS && !formInitialized) {
    setForm(business);
    setFormInitialized(true);
  }

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
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!user || !profile?.business_id || !form.name.trim()) throw new Error('Missing required data');

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

      return { ...form, name: form.name.trim(), instagram_handle: form.instagram_handle.replace(/^@/, '').trim() };
    },
    onSuccess: (updated) => {
      setForm(updated);
      queryClient.invalidateQueries({ queryKey: ['business-account', profile?.business_id] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  const error = queryError
    ? 'Could not load business profile.'
    : saveMutation.error
    ? (saveMutation.error instanceof Error ? saveMutation.error.message : 'Save failed. Please try again.')
    : null;

  const handleSave = () => {
    saveMutation.mutate();
  };

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="animate-pulse space-y-3">
          <div className="h-7 bg-accent-soft/30 rounded w-32" />
          <div className="h-4 bg-accent-soft/30 rounded w-48" />
        </div>
        <div className="bg-white rounded-xl border border-accent-soft p-6 animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 bg-accent-soft/20 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // ── No business linked ─────────────────────────────────────────────────────
  if (!profile?.business_id) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl border border-accent-soft p-8 text-center">
          <Building2 className="w-10 h-10 text-accent-soft mx-auto mb-3" />
          <p className="text-sm font-semibold text-graphite font-sans">No business profile linked</p>
          <p className="text-xs text-graphite/60 font-sans mt-1">Contact support to link your business account.</p>
        </div>
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

      {/* ── Page header ── */}
      <div>
        <h1 className="text-2xl font-sans font-semibold text-graphite tracking-tight">Account</h1>
        <p className="text-sm text-graphite/60 font-sans mt-1">Manage your business profile</p>
      </div>

      {/* ── Identity card ── */}
      <div className="bg-white rounded-xl border border-accent-soft overflow-hidden">
        <div className="px-6 pt-5 pb-4 border-b border-accent-soft flex items-center justify-between">
          <p className="text-xs font-sans font-semibold text-graphite/60 uppercase tracking-wider">Business profile</p>
          <VerificationBadge status={business.verification_status} />
        </div>

        <div className="px-6 pt-5 pb-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-graphite flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-graphite font-sans">
                {business.name || 'Your Business'}
              </p>
              <p className="text-xs text-graphite/60 font-sans">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 pt-4 space-y-4">

          {/* Business name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold font-sans text-graphite">
              Business name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={set('name')}
              placeholder="Your salon or spa name"
              className="w-full px-4 py-2.5 rounded-lg border border-accent-soft text-sm font-sans text-graphite placeholder:text-accent-soft focus:outline-none focus:ring-2 focus:ring-graphite/20"
            />
          </div>

          {/* Business type */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold font-sans text-graphite">
              Business type
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-graphite/60 pointer-events-none" />
              <select
                value={form.type}
                onChange={set('type')}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-accent-soft text-sm font-sans text-graphite bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-graphite/20"
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
              <label className="block text-xs font-semibold font-sans text-graphite">City</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-graphite/60 pointer-events-none" />
                <input
                  type="text"
                  value={form.city}
                  onChange={set('city')}
                  placeholder="Los Angeles"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-accent-soft text-sm font-sans text-graphite placeholder:text-accent-soft focus:outline-none focus:ring-2 focus:ring-graphite/20"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold font-sans text-graphite">State</label>
              <input
                type="text"
                value={form.state}
                onChange={set('state')}
                placeholder="CA"
                maxLength={2}
                className="w-full px-4 py-2.5 rounded-lg border border-accent-soft text-sm font-sans text-graphite placeholder:text-accent-soft focus:outline-none focus:ring-2 focus:ring-graphite/20 uppercase"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold font-sans text-graphite">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-graphite/60 pointer-events-none" />
              <input
                type="tel"
                value={form.phone}
                onChange={set('phone')}
                placeholder="+1 (555) 000-0000"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-accent-soft text-sm font-sans text-graphite placeholder:text-accent-soft focus:outline-none focus:ring-2 focus:ring-graphite/20"
              />
            </div>
          </div>

          {/* Website */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold font-sans text-graphite">Website</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-graphite/60 pointer-events-none" />
              <input
                type="url"
                value={form.website_url}
                onChange={set('website_url')}
                placeholder="https://yourspa.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-accent-soft text-sm font-sans text-graphite placeholder:text-accent-soft focus:outline-none focus:ring-2 focus:ring-graphite/20"
              />
            </div>
          </div>

          {/* Instagram */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold font-sans text-graphite">Instagram</label>
            <div className="relative">
              <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-graphite/60 pointer-events-none" />
              <input
                type="text"
                value={form.instagram_handle}
                onChange={set('instagram_handle')}
                placeholder="@yourspa"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-accent-soft text-sm font-sans text-graphite placeholder:text-accent-soft focus:outline-none focus:ring-2 focus:ring-graphite/20"
              />
            </div>
          </div>

          {/* Email (read-only) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold font-sans text-graphite">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-2.5 rounded-lg border border-accent-soft/60 text-sm font-sans text-graphite/60 bg-background cursor-not-allowed"
            />
            <p className="text-xs text-graphite/60 font-sans">
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
              disabled={saveMutation.isPending || !form.name.trim() || !isDirty}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-graphite hover:bg-graphite/90 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium font-sans rounded-lg transition-colors"
            >
              {saveMutation.isPending ? 'Saving…' : 'Save changes'}
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
        <div className="bg-background rounded-xl border border-accent-soft px-6 py-5">
          <p className="text-sm font-semibold text-graphite font-sans mb-1">
            Get verified to access brand relationships
          </p>
          <p className="text-xs text-graphite/60 font-sans leading-relaxed">
            Verified businesses can connect directly with brands, access wholesale pricing, and place orders.
            Verification is manual — our team reviews your business license. Contact{' '}
            <a href="mailto:support@socelle.com" className="text-graphite underline">support@socelle.com</a>{' '}
            to start the process.
          </p>
        </div>
      )}

      <div className="bg-white rounded-xl border border-accent-soft overflow-hidden">
        <div className="px-6 pt-5 pb-4 border-b border-accent-soft flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-sans font-semibold text-graphite/60 uppercase tracking-wider">Signal library</p>
            <p className="text-sm text-graphite/62 font-sans mt-1">
              Saved and liked intelligence will live on your profile as this library grows.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-graphite/42">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-background px-3 py-1">
              <Bookmark className="h-3.5 w-3.5" />
              {signalLibrary?.savedCount ?? 0} saved
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-background px-3 py-1">
              <Heart className="h-3.5 w-3.5" />
              {signalLibrary?.likedCount ?? 0} liked
            </span>
          </div>
        </div>

        <div className="px-6 py-5">
          {libraryLoading ? (
            <div className="space-y-3 animate-pulse">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="h-16 rounded-xl bg-accent-soft/25" />
              ))}
            </div>
          ) : signalLibrary?.savedSignals?.length ? (
            <div className="space-y-3">
              {signalLibrary.savedSignals.map(({ signal, isLiked, savedAt }) => (
                <Link
                  key={signal.id}
                  to={`/intelligence/signals/${signal.id}`}
                  className="flex items-start justify-between gap-4 rounded-xl border border-accent-soft/70 bg-background px-4 py-4 transition-colors hover:border-graphite/20 hover:bg-accent-soft/20"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-graphite/42">
                      <span>{humanizeSignalType(signal.signal_type)}</span>
                      {signal.source_name && <span>{signal.source_name}</span>}
                    </div>
                    <p className="mt-2 text-sm font-semibold text-graphite leading-6">{signal.title}</p>
                    {signal.description && (
                      <p className="mt-1 text-sm text-graphite/56 line-clamp-2">{signal.description}</p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="flex items-center justify-end gap-2 text-graphite/42">
                      <Bookmark className="h-4 w-4 fill-current" />
                      {isLiked && <Heart className="h-4 w-4 fill-current" />}
                    </div>
                    <p className="mt-2 text-[11px] font-mono text-graphite/42">{timeAgo(savedAt)}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-accent-soft bg-background px-5 py-8 text-center">
              <p className="text-sm font-semibold text-graphite font-sans">No saved intelligence yet</p>
              <p className="mt-2 text-sm text-graphite/56 font-sans">
                Save or like signals from the Intelligence feed and they will show up here.
              </p>
              <Link
                to="/portal/intelligence"
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-graphite/12 px-4 py-2 text-sm font-medium text-graphite hover:border-graphite/20 hover:bg-graphite/[0.03]"
              >
                Browse intelligence
              </Link>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
