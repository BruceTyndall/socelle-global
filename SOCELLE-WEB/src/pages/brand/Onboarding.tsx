import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { CheckCircle, ArrowRight, ArrowLeft, Package, Store, Sparkles } from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Brand Profile' },
  { id: 2, label: 'Shop Setup' },
  { id: 3, label: 'You\'re Live!' },
];

export default function BrandOnboarding() {
  const { profile, refreshProfile } = useAuth();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1 — brand profile
  const [description, setDescription] = useState('');
  const [tagline, setTagline] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');

  // Step 2 — shop config
  const [minOrderNote, setMinOrderNote] = useState('');
  const [returnPolicy, setReturnPolicy] = useState('');
  const [shippingNote, setShippingNote] = useState('');

  const handleSaveProfile = async () => {
    if (!profile?.brand_id) return;
    setSaving(true);
    setError(null);
    try {
      const fullDescription = [tagline, description].filter(Boolean).join('\n\n');
      const { error: updateError } = await supabase
        .from('brands')
        .update({ description: fullDescription || null })
        .eq('id', profile.brand_id);
      if (updateError) throw updateError;
      setStep(2);
      window.scrollTo(0, 0);
    } catch (err: any) {
      setError(err.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveShop = async () => {
    if (!profile?.brand_id) return;
    setSaving(true);
    setError(null);
    try {
      // Store shop config in description appendix for now (Phase 1 — no dedicated columns yet)
      // The brand can refine these in their settings later
      const shopNotes = [
        minOrderNote && `Minimum order: ${minOrderNote}`,
        returnPolicy && `Returns: ${returnPolicy}`,
        shippingNote && `Shipping: ${shippingNote}`,
      ].filter(Boolean).join(' · ');

      if (shopNotes) {
        const { data: brand } = await supabase
          .from('brands')
          .select('description')
          .eq('id', profile.brand_id)
          .maybeSingle();

        const updatedDesc = brand?.description
          ? `${brand.description}\n\n${shopNotes}`
          : shopNotes;

        await supabase
          .from('brands')
          .update({ description: updatedDesc })
          .eq('id', profile.brand_id);
      }

      await refreshProfile();
      setStep(3);
      window.scrollTo(0, 0);
    } catch (err: any) {
      setError(err.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-4 space-y-8">
      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2 flex-1">
            <div className="flex items-center gap-2 min-w-0">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold font-sans ${
                step > s.id
                  ? 'bg-green-500 text-white'
                  : step === s.id
                  ? 'bg-pro-navy text-white'
                  : 'bg-pro-stone text-pro-warm-gray'
              }`}>
                {step > s.id ? <CheckCircle className="w-4 h-4" /> : s.id}
              </div>
              <span className={`text-xs font-sans font-medium truncate hidden sm:block ${
                step === s.id ? 'text-pro-navy' : 'text-pro-warm-gray'
              }`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && <div className="flex-1 h-px bg-pro-stone mx-1" />}
          </div>
        ))}
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-sans">
          {error}
        </div>
      )}

      {/* Step 1: Brand Profile */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-serif text-pro-navy mb-1">
              Set up your brand profile<span className="text-pro-gold">.</span>
            </h1>
            <p className="text-sm text-pro-warm-gray font-sans">
              This is what resellers see when they discover your brand on Socelle.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-pro-stone p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-pro-charcoal font-sans mb-1.5">
                Brand Tagline
              </label>
              <input
                type="text"
                value={tagline}
                onChange={e => setTagline(e.target.value)}
                placeholder="e.g. Clinical skincare rooted in botanical science"
                maxLength={120}
                className="w-full px-4 py-2.5 rounded-lg border border-pro-stone bg-pro-ivory text-pro-charcoal font-sans text-sm focus:outline-none focus:ring-2 focus:ring-pro-navy/20 focus:border-pro-navy transition-colors"
              />
              <p className="mt-1 text-xs text-pro-warm-gray font-sans">{tagline.length}/120</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-pro-charcoal font-sans mb-1.5">
                Brand Story / About
              </label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Tell resellers what makes your brand unique — your founding story, ingredients philosophy, key product lines…"
                rows={5}
                maxLength={1200}
                className="w-full px-4 py-2.5 rounded-lg border border-pro-stone bg-pro-ivory text-pro-charcoal font-sans text-sm focus:outline-none focus:ring-2 focus:ring-pro-navy/20 focus:border-pro-navy transition-colors resize-none"
              />
              <p className="mt-1 text-xs text-pro-warm-gray font-sans">{description.length}/1200</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-pro-charcoal font-sans mb-1.5">
                Instagram Handle <span className="text-pro-warm-gray font-normal">(optional)</span>
              </label>
              <div className="flex items-center gap-0">
                <span className="px-3 py-2.5 bg-pro-stone rounded-l-lg border border-r-0 border-pro-stone text-pro-warm-gray text-sm font-sans">@</span>
                <input
                  type="text"
                  value={instagramHandle}
                  onChange={e => setInstagramHandle(e.target.value.replace('@', ''))}
                  placeholder="yourbrand"
                  className="flex-1 px-4 py-2.5 rounded-r-lg border border-pro-stone bg-pro-ivory text-pro-charcoal font-sans text-sm focus:outline-none focus:ring-2 focus:ring-pro-navy/20 focus:border-pro-navy transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-pro-navy text-white rounded-lg font-medium font-sans text-sm hover:bg-pro-charcoal transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save & Continue'}
              {!saving && <ArrowRight className="w-4 h-4" />}
            </button>
            <button
              onClick={() => { setStep(2); window.scrollTo(0, 0); }}
              className="px-4 py-3 rounded-lg border border-pro-stone text-pro-warm-gray font-sans text-sm hover:bg-pro-cream transition-colors"
            >
              Skip
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Shop Config */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <button
              onClick={() => { setStep(1); setError(null); }}
              className="flex items-center gap-1.5 text-sm text-pro-warm-gray hover:text-pro-charcoal font-sans mb-4 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
            <h1 className="text-2xl font-serif text-pro-navy mb-1">
              Configure your shop<span className="text-pro-gold">.</span>
            </h1>
            <p className="text-sm text-pro-warm-gray font-sans">
              Let resellers know your ordering requirements and policies upfront.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-pro-stone p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-pro-charcoal font-sans mb-1.5">
                Minimum Order <span className="text-pro-warm-gray font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={minOrderNote}
                onChange={e => setMinOrderNote(e.target.value)}
                placeholder="e.g. $150 minimum first order"
                className="w-full px-4 py-2.5 rounded-lg border border-pro-stone bg-pro-ivory text-pro-charcoal font-sans text-sm focus:outline-none focus:ring-2 focus:ring-pro-navy/20 focus:border-pro-navy transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-pro-charcoal font-sans mb-1.5">
                Return Policy <span className="text-pro-warm-gray font-normal">(optional)</span>
              </label>
              <textarea
                value={returnPolicy}
                onChange={e => setReturnPolicy(e.target.value)}
                placeholder="e.g. Returns accepted within 30 days for unopened items in original packaging."
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg border border-pro-stone bg-pro-ivory text-pro-charcoal font-sans text-sm focus:outline-none focus:ring-2 focus:ring-pro-navy/20 focus:border-pro-navy transition-colors resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-pro-charcoal font-sans mb-1.5">
                Shipping Notes <span className="text-pro-warm-gray font-normal">(optional)</span>
              </label>
              <textarea
                value={shippingNote}
                onChange={e => setShippingNote(e.target.value)}
                placeholder="e.g. Orders ship within 3–5 business days. Free shipping on orders over $300."
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg border border-pro-stone bg-pro-ivory text-pro-charcoal font-sans text-sm focus:outline-none focus:ring-2 focus:ring-pro-navy/20 focus:border-pro-navy transition-colors resize-none"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleSaveShop}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-pro-navy text-white rounded-lg font-medium font-sans text-sm hover:bg-pro-charcoal transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save & Continue'}
              {!saving && <ArrowRight className="w-4 h-4" />}
            </button>
            <button
              onClick={() => { setStep(3); window.scrollTo(0, 0); }}
              className="px-4 py-3 rounded-lg border border-pro-stone text-pro-warm-gray font-sans text-sm hover:bg-pro-cream transition-colors"
            >
              Skip
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Done */}
      {step === 3 && (
        <div className="space-y-6 text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>

          <div>
            <h1 className="text-2xl font-serif text-pro-navy mb-2">
              You're all set<span className="text-pro-gold">.</span>
            </h1>
            <p className="text-sm text-pro-warm-gray font-sans">
              Your brand profile is live. Complete these steps to start receiving orders from resellers.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-pro-stone p-6 text-left space-y-3">
            <h2 className="text-sm font-semibold text-pro-charcoal font-sans uppercase tracking-wide mb-4">Next steps</h2>
            {[
              {
                icon: Package,
                label: 'Add your products',
                sub: 'Upload at least 5 SKUs with wholesale pricing to unlock your storefront',
                to: '/brand/products',
                cta: 'Add products',
              },
              {
                icon: Store,
                label: 'Preview your storefront',
                sub: 'See how resellers will discover your brand',
                to: '/brand/storefront',
                cta: 'Preview',
              },
              {
                icon: Sparkles,
                label: 'Go to your dashboard',
                sub: 'Track orders, revenue, and reseller activity',
                to: '/brand/dashboard',
                cta: 'Dashboard',
              },
            ].map(({ icon: Icon, label, sub, to, cta }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center justify-between p-4 rounded-lg border border-pro-stone hover:border-pro-charcoal/30 hover:bg-pro-cream/50 transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-pro-cream flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-pro-navy" />
                  </div>
                  <div>
                    <p className="font-medium text-pro-charcoal font-sans text-sm">{label}</p>
                    <p className="text-xs text-pro-warm-gray font-sans mt-0.5">{sub}</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-pro-gold group-hover:text-pro-navy font-sans transition-colors flex-shrink-0 ml-3">
                  {cta} →
                </span>
              </Link>
            ))}
          </div>

          <Link
            to="/brand/dashboard"
            className="block w-full px-6 py-3 bg-pro-navy text-white rounded-lg font-medium font-sans text-sm hover:bg-pro-charcoal transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      )}
    </div>
  );
}
