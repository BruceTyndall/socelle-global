import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';

const PRODUCT_CATEGORIES = [
  'Skincare',
  'Haircare',
  'Bodycare',
  'Nail & Nailcare',
  'Wellness & Spa',
  'Makeup & Color',
  'Equipment & Tools',
  'Fragrance',
  'Other',
];

const SKU_RANGES = [
  '5–20 SKUs',
  '21–50 SKUs',
  '51–100 SKUs',
  '100+ SKUs',
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function BrandApply() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1 — brand info
  const [brandName, setBrandName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [category, setCategory] = useState('');
  const [skuRange, setSkuRange] = useState('');

  // Step 2 — account creation
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const step1Valid = brandName.trim() && websiteUrl.trim() && category && skuRange;

  const step2Valid =
    firstName.trim() &&
    lastName.trim() &&
    email.trim() &&
    password.length >= 8 &&
    password === confirmPassword &&
    agreedToTerms;

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!step1Valid) return;
    setStep(2);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!step2Valid) return;

    setLoading(true);
    setError(null);

    try {
      // 1. Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (authError) throw new Error(authError.message);
      if (!authData.user) throw new Error('Account creation failed — please try again.');

      const userId = authData.user.id;
      const slug = slugify(brandName) || `brand-${Date.now()}`;
      const description = `${category} · ${skuRange}`;

      // 2. Create brand row
      const { data: brandData, error: brandError } = await supabase
        .from('brands')
        .insert({
          name: brandName.trim(),
          slug,
          status: 'pending',
          website_url: websiteUrl.trim(),
          description,
          verification_status: 'pending_verification',
        })
        .select('id')
        .single();

      if (brandError) throw new Error(`Brand creation failed: ${brandError.message}`);

      const brandId = brandData.id;

      // 3. Upsert user profile as brand_admin linked to this brand
      await supabase
        .from('user_profiles')
        .upsert({
          id: userId,
          role: 'brand_admin',
          brand_id: brandId,
          contact_email: email.trim(),
          created_at: new Date().toISOString(),
        }, { onConflict: 'id' });

      navigate('/brand/apply/received');
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-accent-soft bg-white">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="font-sans text-xl text-graphite">
            socelle<span className="text-accent">.</span>
          </Link>
          <p className="text-sm text-graphite/60 font-sans">
            Already a partner?{' '}
            <Link to="/brand/login" className="text-graphite font-medium hover:text-accent transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 py-12">
        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-8">
          <div className={`flex items-center gap-2 text-sm font-medium font-sans ${step === 1 ? 'text-graphite' : 'text-graphite/60'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 1 ? 'bg-graphite text-white' : 'bg-green-500 text-white'}`}>
              {step > 1 ? <CheckCircle className="w-4 h-4" /> : '1'}
            </div>
            Brand Info
          </div>
          <div className="flex-1 h-px bg-accent-soft" />
          <div className={`flex items-center gap-2 text-sm font-medium font-sans ${step === 2 ? 'text-graphite' : 'text-graphite/60'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step === 2 ? 'bg-graphite text-white' : 'bg-accent-soft text-graphite/60'}`}>
              2
            </div>
            Your Account
          </div>
        </div>

        {/* Step 1: Brand Info */}
        {step === 1 && (
          <form onSubmit={handleStep1} className="space-y-6">
            <div>
              <h1 className="text-3xl font-sans text-graphite mb-2">
                Apply to join Socelle<span className="text-accent">.</span>
              </h1>
              <p className="text-graphite/60 font-sans text-sm">
                Tell us about your brand. Our team reviews every application within 2 business days.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-accent-soft p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-graphite font-sans mb-1.5">
                  Brand Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={e => setBrandName(e.target.value)}
                  placeholder="e.g. Naturopathica"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-accent-soft bg-background text-graphite font-sans text-sm focus:outline-none focus:ring-2 focus:ring-graphite/20 focus:border-graphite transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-graphite font-sans mb-1.5">
                  Website URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={e => setWebsiteUrl(e.target.value)}
                  placeholder="https://yourbrand.com"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-accent-soft bg-background text-graphite font-sans text-sm focus:outline-none focus:ring-2 focus:ring-graphite/20 focus:border-graphite transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-graphite font-sans mb-1.5">
                  Product Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-accent-soft bg-background text-graphite font-sans text-sm focus:outline-none focus:ring-2 focus:ring-graphite/20 focus:border-graphite transition-colors"
                >
                  <option value="">Select a category</option>
                  {PRODUCT_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-graphite font-sans mb-1.5">
                  Estimated SKU Count <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {SKU_RANGES.map(range => (
                    <button
                      key={range}
                      type="button"
                      onClick={() => setSkuRange(range)}
                      className={`px-4 py-2.5 rounded-lg border text-sm font-medium font-sans transition-colors ${
                        skuRange === range
                          ? 'border-graphite bg-graphite text-white'
                          : 'border-accent-soft bg-background text-graphite hover:border-graphite/40'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-accent-soft rounded-xl border border-accent-soft p-4 text-sm text-graphite/60 font-sans">
              <strong className="text-graphite">Requirements:</strong> Active business entity, professional beauty products, minimum 5 SKUs, product liability insurance.
            </div>

            <button
              type="submit"
              disabled={!step1Valid}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-graphite text-white rounded-lg font-medium font-sans text-sm hover:bg-graphite transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Step 2: Account Creation */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <button
                type="button"
                onClick={() => { setStep(1); setError(null); }}
                className="flex items-center gap-1.5 text-sm text-graphite/60 hover:text-graphite font-sans mb-4 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
              <h1 className="text-3xl font-sans text-graphite mb-2">
                Create your account<span className="text-accent">.</span>
              </h1>
              <p className="text-graphite/60 font-sans text-sm">
                You'll use this to manage <strong className="text-graphite">{brandName}</strong> on Socelle after approval.
              </p>
            </div>

            {error && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-sans">
                {error}
              </div>
            )}

            <div className="bg-white rounded-xl border border-accent-soft p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-graphite font-sans mb-1.5">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    placeholder="Jane"
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-accent-soft bg-background text-graphite font-sans text-sm focus:outline-none focus:ring-2 focus:ring-graphite/20 focus:border-graphite transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-graphite font-sans mb-1.5">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    placeholder="Smith"
                    required
                    className="w-full px-4 py-2.5 rounded-lg border border-accent-soft bg-background text-graphite font-sans text-sm focus:outline-none focus:ring-2 focus:ring-graphite/20 focus:border-graphite transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-graphite font-sans mb-1.5">
                  Work Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="jane@yourbrand.com"
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-accent-soft bg-background text-graphite font-sans text-sm focus:outline-none focus:ring-2 focus:ring-graphite/20 focus:border-graphite transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-graphite font-sans mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  required
                  minLength={8}
                  className="w-full px-4 py-2.5 rounded-lg border border-accent-soft bg-background text-graphite font-sans text-sm focus:outline-none focus:ring-2 focus:ring-graphite/20 focus:border-graphite transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-graphite font-sans mb-1.5">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  required
                  className={`w-full px-4 py-2.5 rounded-lg border bg-background text-graphite font-sans text-sm focus:outline-none focus:ring-2 focus:ring-graphite/20 transition-colors ${
                    confirmPassword && confirmPassword !== password
                      ? 'border-red-300 focus:border-red-400'
                      : 'border-accent-soft focus:border-graphite'
                  }`}
                />
                {confirmPassword && confirmPassword !== password && (
                  <p className="mt-1 text-xs text-red-600 font-sans">Passwords don't match</p>
                )}
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={e => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 rounded border-accent-soft accent-graphite"
                />
                <span className="text-sm text-graphite/60 font-sans">
                  I agree to Socelle's{' '}
                  <Link to="/terms" className="text-graphite hover:text-accent underline underline-offset-2">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-graphite hover:text-accent underline underline-offset-2">
                    Privacy Policy
                  </Link>
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={!step2Valid || loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-graphite text-white rounded-lg font-medium font-sans text-sm hover:bg-graphite transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Submitting…
                </>
              ) : (
                <>
                  Submit Application
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-center text-xs text-graphite/60 font-sans">
              By submitting, you understand your application will be reviewed by our team before access is granted.
            </p>
          </form>
        )}
      </main>
    </div>
  );
}
