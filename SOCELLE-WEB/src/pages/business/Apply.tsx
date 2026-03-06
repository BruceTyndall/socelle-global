/**
 * Reseller Application Page — /portal/apply
 *
 * Collects business details and a license number, then sets
 * verification_status = 'pending_verification' on the businesses row.
 * The admin approval queue at /admin/approvals handles the review.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ChevronDown } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { Button, Input } from '../../components/ui';

const BUSINESS_TYPES = [
  'Day Spa',
  'Med Spa / Medical Spa',
  'Hair Salon',
  'Nail Salon',
  'Barbershop',
  'Yoga Studio',
  'Wellness Center',
  'Esthetics Studio',
  'Cosmetic Surgery / Dermatology',
  'Resort / Hotel Spa',
  'Other',
];

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN',
  'IA','KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV',
  'NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN',
  'TX','UT','VT','VA','WA','WV','WI','WY','DC',
];

interface FormData {
  business_name: string;
  business_type: string;
  city: string;
  state: string;
  phone: string;
  website_url: string;
  license_number: string;
  license_state: string;
  agreed: boolean;
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-medium font-sans text-pro-charcoal mb-1.5">
      {children}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

function Select({
  value, onChange, options, placeholder, disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        className="w-full appearance-none px-4 py-2.5 border border-pro-stone rounded-lg text-sm font-sans text-pro-charcoal bg-white focus:outline-none focus:ring-2 focus:ring-pro-navy/20 focus:border-pro-navy transition-colors disabled:opacity-50"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pro-warm-gray pointer-events-none" />
    </div>
  );
}

export default function ResellerApply() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormData>({
    business_name: '',
    business_type: '',
    city: '',
    state: '',
    phone: '',
    website_url: '',
    license_number: '',
    license_state: '',
    agreed: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (field: keyof FormData) => (value: string | boolean) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const isValid =
    form.business_name.trim().length > 0 &&
    form.business_type.length > 0 &&
    form.city.trim().length > 0 &&
    form.state.length > 0 &&
    form.agreed;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !profile?.business_id || !user) return;
    setSubmitting(true);
    setError(null);

    try {
      // Update businesses row with profile data + set pending_verification
      const { error: bizErr } = await supabase
        .from('businesses')
        .update({
          name:                form.business_name.trim(),
          type:                form.business_type,
          city:                form.city.trim(),
          state:               form.state,
          phone:               form.phone.trim() || null,
          website_url:         form.website_url.trim() || null,
          verification_status: 'pending_verification',
        })
        .eq('id', profile.business_id);

      if (bizErr) throw bizErr;

      // Also update user_profiles.spa_name
      await supabase
        .from('user_profiles')
        .update({ spa_name: form.business_name.trim() })
        .eq('id', user.id);

      setSubmitted(true);
    } catch (err: any) {
      console.warn('Apply error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-serif text-pro-navy mb-3">Application Received</h1>
        <p className="text-sm text-pro-warm-gray font-sans mb-8 max-w-sm mx-auto">
          Your application has been submitted for review. You&apos;ll receive an update from our team
          within 1–2 business days. In the meantime, you can browse brands.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => navigate('/brands')}>Browse Brands</Button>
          <Button variant="secondary" onClick={() => navigate('/portal/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-semibold font-sans uppercase tracking-wider text-pro-gold mb-2">
          Retailer Verification
        </p>
        <h1 className="text-3xl font-serif text-pro-navy mb-3">Apply for a Wholesale Account</h1>
        <p className="text-sm text-pro-warm-gray font-sans leading-relaxed max-w-lg">
          To access wholesale pricing and place orders, we verify that you operate a licensed
          professional beauty business. This typically takes 1–2 business days.
        </p>
      </div>

      {/* What to expect */}
      <div className="bg-pro-ivory border border-pro-stone rounded-xl p-5 mb-8">
        <h2 className="text-sm font-semibold font-sans text-pro-charcoal mb-3">What happens next</h2>
        <ol className="space-y-2">
          {[
            'You submit this form with your business details.',
            'Our team reviews your application (1–2 business days).',
            'You receive an email confirmation when approved.',
            'Start ordering wholesale from any brand on SOCELLE.',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-pro-navy text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span className="text-sm font-sans text-pro-charcoal">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Info */}
        <div className="bg-white rounded-xl border border-pro-stone p-6 space-y-5">
          <h2 className="text-base font-semibold font-sans text-pro-charcoal">Business Information</h2>

          <div>
            <FieldLabel required>Business Name</FieldLabel>
            <Input
              value={form.business_name}
              onChange={e => set('business_name')(e.target.value)}
              placeholder="Your salon or spa name"
              required
            />
          </div>

          <div>
            <FieldLabel required>Business Type</FieldLabel>
            <Select
              value={form.business_type}
              onChange={set('business_type')}
              options={BUSINESS_TYPES}
              placeholder="Select your business type"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel required>City</FieldLabel>
              <Input
                value={form.city}
                onChange={e => set('city')(e.target.value)}
                placeholder="City"
                required
              />
            </div>
            <div>
              <FieldLabel required>State</FieldLabel>
              <Select
                value={form.state}
                onChange={set('state')}
                options={US_STATES}
                placeholder="State"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>Phone</FieldLabel>
              <Input
                value={form.phone}
                onChange={e => set('phone')(e.target.value)}
                placeholder="+1 (555) 000-0000"
                type="tel"
              />
            </div>
            <div>
              <FieldLabel>Website</FieldLabel>
              <Input
                value={form.website_url}
                onChange={e => set('website_url')(e.target.value)}
                placeholder="https://yourspa.com"
                type="url"
              />
            </div>
          </div>
        </div>

        {/* License */}
        <div className="bg-white rounded-xl border border-pro-stone p-6 space-y-5">
          <div>
            <h2 className="text-base font-semibold font-sans text-pro-charcoal">License Information</h2>
            <p className="text-xs text-pro-warm-gray font-sans mt-1">
              We verify cosmetology, esthetics, or business licenses to confirm professional status. 
              If you don&apos;t have a license number handy, our team will reach out during review.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>License / Registration Number</FieldLabel>
              <Input
                value={form.license_number}
                onChange={e => set('license_number')(e.target.value)}
                placeholder="e.g. COS-123456"
              />
            </div>
            <div>
              <FieldLabel>License State</FieldLabel>
              <Select
                value={form.license_state}
                onChange={set('license_state')}
                options={US_STATES}
                placeholder="State issued"
              />
            </div>
          </div>
        </div>

        {/* Agreement */}
        <div className="flex items-start gap-3">
          <input
            id="agree"
            type="checkbox"
            checked={form.agreed}
            onChange={e => set('agreed')(e.target.checked)}
            className="w-4 h-4 mt-0.5 accent-pro-navy rounded"
          />
          <label htmlFor="agree" className="text-sm font-sans text-pro-charcoal leading-relaxed">
            I confirm that I operate a licensed professional beauty business and agree to
            SOCELLE&apos;s{' '}
            <a href="/terms" target="_blank" className="text-pro-navy underline hover:text-pro-gold transition-colors">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" target="_blank" className="text-pro-navy underline hover:text-pro-gold transition-colors">
              Privacy Policy
            </a>
            .
          </label>
        </div>

        {error && (
          <p className="text-sm text-red-600 font-sans bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={!isValid || submitting}
            className="flex-1"
          >
            {submitting ? 'Submitting…' : 'Submit Application'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/portal/dashboard')}
            disabled={submitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
