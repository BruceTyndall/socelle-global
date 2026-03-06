import { useState } from 'react';
import { Building2, Users, Plus, Loader2, CheckCircle, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { useToast } from '../../components/Toast';

// ── Types ──────────────────────────────────────────────────────────────────

type Tab = 'brand' | 'business';

interface BrandSeedForm {
  name: string;
  slug: string;
  website_url: string;
  description: string;
  logo_url: string;
  service_tier: 'standard' | 'premier';
  contact_email: string;
  category_tags: string;
}

interface BusinessSeedForm {
  name: string;
  slug: string;
  website_url: string;
  description: string;
  city: string;
  state: string;
  business_type: 'salon' | 'spa' | 'medspa' | 'retail' | 'other' | '';
}

const INITIAL_BRAND_FORM: BrandSeedForm = {
  name: '',
  slug: '',
  website_url: '',
  description: '',
  logo_url: '',
  service_tier: 'standard',
  contact_email: '',
  category_tags: '',
};

const INITIAL_BUSINESS_FORM: BusinessSeedForm = {
  name: '',
  slug: '',
  website_url: '',
  description: '',
  city: '',
  state: '',
  business_type: '',
};

// ── Slug generation ────────────────────────────────────────────────────────

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// ── Main component ─────────────────────────────────────────────────────────

export default function AdminSeeding() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [tab, setTab] = useState<Tab>('brand');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif text-pro-navy">
          Seeding<span className="text-pro-gold">.</span>
        </h1>
        <p className="text-pro-warm-gray font-sans mt-1">
          Manually seed unverified brand and business pages for platform cold start
        </p>
      </div>

      {/* Info banner */}
      <div className="bg-pro-cream border border-pro-stone rounded-xl p-4 flex gap-3">
        <div className="w-5 h-5 rounded-full bg-pro-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-pro-gold text-xs font-bold">i</span>
        </div>
        <div className="text-sm text-pro-charcoal font-sans space-y-1">
          <p><strong>Seeded records are unverified by default.</strong> They appear in the directory but display an unverified badge. Brands can claim their page via the public application flow. Admin team follows up via outreach.</p>
          <p className="text-pro-warm-gray">Slug is auto-generated from name — edit it only if a conflict exists.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-pro-stone/40 rounded-xl p-1 w-fit">
        <button
          type="button"
          onClick={() => setTab('brand')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium font-sans transition-colors ${
            tab === 'brand'
              ? 'bg-white text-pro-navy shadow-sm'
              : 'text-pro-warm-gray hover:text-pro-charcoal'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Seed Brand
        </button>
        <button
          type="button"
          onClick={() => setTab('business')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium font-sans transition-colors ${
            tab === 'business'
              ? 'bg-white text-pro-navy shadow-sm'
              : 'text-pro-warm-gray hover:text-pro-charcoal'
          }`}
        >
          <Users className="w-4 h-4" />
          Seed Business
        </button>
      </div>

      {/* Form panel */}
      {tab === 'brand' ? (
        <BrandSeedPanel userId={user?.id ?? null} addToast={addToast} />
      ) : (
        <BusinessSeedPanel userId={user?.id ?? null} addToast={addToast} />
      )}
    </div>
  );
}

// ── Brand seed panel ───────────────────────────────────────────────────────

function BrandSeedPanel({
  userId,
  addToast,
}: {
  userId: string | null;
  addToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}) {
  const [form, setForm] = useState<BrandSeedForm>(INITIAL_BRAND_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [lastSeeded, setLastSeeded] = useState<string | null>(null);
  const [slugManual, setSlugManual] = useState(false);

  function handleNameChange(name: string) {
    setForm(prev => ({
      ...prev,
      name,
      slug: slugManual ? prev.slug : toSlug(name),
    }));
  }

  function handleSlugChange(slug: string) {
    setSlugManual(true);
    setForm(prev => ({ ...prev, slug: toSlug(slug) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim()) {
      addToast('Name and slug are required.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const tagsArray = form.category_tags
        ? form.category_tags.split(',').map(t => t.trim()).filter(Boolean)
        : [];

      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim() || null,
        logo_url: form.logo_url.trim() || null,
        website_url: form.website_url.trim() || null,
        contact_email: form.contact_email.trim() || null,
        service_tier: form.service_tier,
        category_tags: tagsArray.length > 0 ? tagsArray : null,
        verification_status: 'unverified',
        outreach_status: 'not_contacted',
        seeded_by: userId,
        is_published: false,
        status: 'draft',
      };

      const { data, error } = await supabase
        .from('brands')
        .insert(payload)
        .select('id, name')
        .single();

      if (error) {
        if (error.code === '23505') {
          addToast('A brand with that slug already exists.', 'error');
        } else {
          throw error;
        }
        return;
      }

      setLastSeeded(data.name);
      setForm(INITIAL_BRAND_FORM);
      setSlugManual(false);
      addToast(`${data.name} seeded successfully.`, 'success');
    } catch (err: any) {
      console.error('Error seeding brand:', err);
      addToast(err?.message || 'Failed to seed brand.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl">
      {lastSeeded && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div className="flex-1 text-sm text-green-800 font-sans">
            <strong>{lastSeeded}</strong> was seeded. You can seed another brand below.
          </div>
          <button
            type="button"
            onClick={() => setLastSeeded(null)}
            className="text-green-600 hover:text-green-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-pro-stone rounded-xl p-6 space-y-5">
        <h2 className="text-lg font-serif text-pro-navy">Seed a Brand</h2>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-pro-charcoal font-sans mb-1.5">
            Brand name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={e => handleNameChange(e.target.value)}
            placeholder="e.g. Naturopathica"
            className="w-full px-3 py-2.5 border border-pro-stone rounded-lg font-sans text-sm focus:outline-none focus:ring-2 focus:ring-pro-navy focus:border-pro-navy"
            required
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-pro-charcoal font-sans mb-1.5">
            Slug <span className="text-red-500">*</span>
            <span className="ml-2 text-xs text-pro-warm-gray font-normal">Auto-generated — edit only if conflict exists</span>
          </label>
          <div className="flex items-center border border-pro-stone rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-pro-navy focus-within:border-pro-navy">
            <span className="px-3 py-2.5 bg-pro-cream text-pro-warm-gray text-sm font-sans border-r border-pro-stone flex-shrink-0">
              /brands/
            </span>
            <input
              type="text"
              value={form.slug}
              onChange={e => handleSlugChange(e.target.value)}
              placeholder="brand-slug"
              className="flex-1 px-3 py-2.5 font-sans text-sm focus:outline-none"
              required
            />
          </div>
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm font-medium text-pro-charcoal font-sans mb-1.5">
            Website URL
          </label>
          <input
            type="url"
            value={form.website_url}
            onChange={e => setForm(prev => ({ ...prev, website_url: e.target.value }))}
            placeholder="https://brand.com"
            className="w-full px-3 py-2.5 border border-pro-stone rounded-lg font-sans text-sm focus:outline-none focus:ring-2 focus:ring-pro-navy focus:border-pro-navy"
          />
        </div>

        {/* Contact email */}
        <div>
          <label className="block text-sm font-medium text-pro-charcoal font-sans mb-1.5">
            Contact email
          </label>
          <input
            type="email"
            value={form.contact_email}
            onChange={e => setForm(prev => ({ ...prev, contact_email: e.target.value }))}
            placeholder="hello@brand.com"
            className="w-full px-3 py-2.5 border border-pro-stone rounded-lg font-sans text-sm focus:outline-none focus:ring-2 focus:ring-pro-navy focus:border-pro-navy"
          />
        </div>

        {/* Service tier */}
        <div>
          <label className="block text-sm font-medium text-pro-charcoal font-sans mb-1.5">
            Service tier
          </label>
          <select
            value={form.service_tier}
            onChange={e => setForm(prev => ({ ...prev, service_tier: e.target.value as 'standard' | 'premier' }))}
            className="w-full px-3 py-2.5 border border-pro-stone rounded-lg font-sans text-sm focus:outline-none focus:ring-2 focus:ring-pro-navy focus:border-pro-navy bg-white"
          >
            <option value="standard">Standard — self-serve</option>
            <option value="premier">Premier — managed by Socelle</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-pro-charcoal font-sans mb-1.5">
            Short description
          </label>
          <textarea
            value={form.description}
            onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Brief description of the brand and what they offer..."
            rows={3}
            className="w-full px-3 py-2.5 border border-pro-stone rounded-lg font-sans text-sm focus:outline-none focus:ring-2 focus:ring-pro-navy focus:border-pro-navy resize-none"
          />
        </div>

        {/* Logo URL */}
        <div>
          <label className="block text-sm font-medium text-pro-charcoal font-sans mb-1.5">
            Logo URL
          </label>
          <input
            type="url"
            value={form.logo_url}
            onChange={e => setForm(prev => ({ ...prev, logo_url: e.target.value }))}
            placeholder="https://cdn.brand.com/logo.png"
            className="w-full px-3 py-2.5 border border-pro-stone rounded-lg font-sans text-sm focus:outline-none focus:ring-2 focus:ring-pro-navy focus:border-pro-navy"
          />
        </div>

        {/* Category tags */}
        <div>
          <label className="block text-sm font-medium text-pro-charcoal font-sans mb-1.5">
            Category tags
            <span className="ml-2 text-xs text-pro-warm-gray font-normal">Comma-separated</span>
          </label>
          <input
            type="text"
            value={form.category_tags}
            onChange={e => setForm(prev => ({ ...prev, category_tags: e.target.value }))}
            placeholder="skincare, anti-aging, professional"
            className="w-full px-3 py-2.5 border border-pro-stone rounded-lg font-sans text-sm focus:outline-none focus:ring-2 focus:ring-pro-navy focus:border-pro-navy"
          />
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting || !form.name.trim() || !form.slug.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-pro-navy text-white rounded-lg hover:bg-pro-charcoal disabled:opacity-50 disabled:cursor-not-allowed font-sans text-sm font-medium transition-colors"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {submitting ? 'Seeding…' : 'Seed Brand'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ── Business seed panel ────────────────────────────────────────────────────

function BusinessSeedPanel({
  userId,
  addToast,
}: {
  userId: string | null;
  addToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}) {
  const [form, setForm] = useState<BusinessSeedForm>(INITIAL_BUSINESS_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [lastSeeded, setLastSeeded] = useState<string | null>(null);
  const [slugManual, setSlugManual] = useState(false);

  function handleNameChange(name: string) {
    setForm(prev => ({
      ...prev,
      name,
      slug: slugManual ? prev.slug : toSlug(name),
    }));
  }

  function handleSlugChange(slug: string) {
    setSlugManual(true);
    setForm(prev => ({ ...prev, slug: toSlug(slug) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.slug.trim()) {
      addToast('Name and slug are required.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description.trim() || null,
        website_url: form.website_url.trim() || null,
        city: form.city.trim() || null,
        state: form.state.trim() || null,
        business_type: form.business_type || null,
        verification_status: 'unverified',
        outreach_status: 'not_contacted',
        seeded_by: userId,
      };

      const { data, error } = await supabase
        .from('businesses')
        .insert(payload)
        .select('id, name')
        .single();

      if (error) {
        if (error.code === '23505') {
          addToast('A business with that slug already exists.', 'error');
        } else {
          throw error;
        }
        return;
      }

      setLastSeeded(data.name);
      setForm(INITIAL_BUSINESS_FORM);
      setSlugManual(false);
      addToast(`${data.name} seeded successfully.`, 'success');
    } catch (err: any) {
      console.error('Error seeding business:', err);
      addToast(err?.message || 'Failed to seed business.', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl">
      {lastSeeded && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <div className="flex-1 text-sm text-green-800 font-sans">
            <strong>{lastSeeded}</strong> was seeded. You can seed another business below.
          </div>
          <button
            type="button"
            onClick={() => setLastSeeded(null)}
            className="text-green-600 hover:text-green-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border border-pro-stone rounded-xl p-6 space-y-5">
        <h2 className="text-lg font-serif text-pro-navy">Seed a Business</h2>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-pro-charcoal font-sans mb-1.5">
            Business name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={e => handleNameChange(e.target.value)}
            placeholder="e.g. Skin Lounge Beverly Hills"
            className="w-full px-3 py-2.5 border border-pro-stone rounded-lg font-sans text-sm focus:outline-none focus:ring-2 focus:ring-pro-navy focus:border-pro-navy"
            required
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-pro-charcoal font-sans mb-1.5">
            Slug <span className="text-red-500">*</span>
            <span className="ml-2 text-xs text-pro-warm-gray font-normal">Auto-generated — edit only if conflict exists</span>
          </label>
          <div className="flex items-center border border-pro-stone rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-pro-navy focus-within:border-pro-navy">
            <span className="px-3 py-2.5 bg-pro-cream text-pro-warm-gray text-sm font-sans border-r border-pro-stone flex-shrink-0">
              /businesses/
            </span>
            <input
              type="text"
              value={form.slug}
              onChange={e => handleSlugChange(e.target.value)}
              placeholder="business-slug"
              className="flex-1 px-3 py-2.5 font-sans text-sm focus:outline-none"
              required
            />
          </div>
        </div>

        {/* Business type */}
        <div>
          <label className="block text-sm font-medium text-pro-charcoal font-sans mb-1.5">
            Business type
          </label>
          <select
            value={form.business_type}
            onChange={e => setForm(prev => ({ ...prev, business_type: e.target.value as BusinessSeedForm['business_type'] }))}
            className="w-full px-3 py-2.5 border border-pro-stone rounded-lg font-sans text-sm focus:outline-none focus:ring-2 focus:ring-pro-navy focus:border-pro-navy bg-white"
          >
            <option value="">Select type…</option>
            <option value="salon">Salon</option>
            <option value="spa">Spa</option>
            <option value="medspa">MedSpa</option>
            <option value="retail">Retail</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Location */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-pro-charcoal font-sans mb-1.5">
              City
            </label>
            <input
              type="text"
              value={form.city}
              onChange={e => setForm(prev => ({ ...prev, city: e.target.value }))}
              placeholder="Beverly Hills"
              className="w-full px-3 py-2.5 border border-pro-stone rounded-lg font-sans text-sm focus:outline-none focus:ring-2 focus:ring-pro-navy focus:border-pro-navy"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-pro-charcoal font-sans mb-1.5">
              State
            </label>
            <input
              type="text"
              value={form.state}
              onChange={e => setForm(prev => ({ ...prev, state: e.target.value }))}
              placeholder="CA"
              maxLength={2}
              className="w-full px-3 py-2.5 border border-pro-stone rounded-lg font-sans text-sm focus:outline-none focus:ring-2 focus:ring-pro-navy focus:border-pro-navy uppercase"
            />
          </div>
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm font-medium text-pro-charcoal font-sans mb-1.5">
            Website URL
          </label>
          <input
            type="url"
            value={form.website_url}
            onChange={e => setForm(prev => ({ ...prev, website_url: e.target.value }))}
            placeholder="https://skinlounge.com"
            className="w-full px-3 py-2.5 border border-pro-stone rounded-lg font-sans text-sm focus:outline-none focus:ring-2 focus:ring-pro-navy focus:border-pro-navy"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-pro-charcoal font-sans mb-1.5">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Brief description of the business..."
            rows={3}
            className="w-full px-3 py-2.5 border border-pro-stone rounded-lg font-sans text-sm focus:outline-none focus:ring-2 focus:ring-pro-navy focus:border-pro-navy resize-none"
          />
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting || !form.name.trim() || !form.slug.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-pro-navy text-white rounded-lg hover:bg-pro-charcoal disabled:opacity-50 disabled:cursor-not-allowed font-sans text-sm font-medium transition-colors"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {submitting ? 'Seeding…' : 'Seed Business'}
          </button>
        </div>
      </form>
    </div>
  );
}
