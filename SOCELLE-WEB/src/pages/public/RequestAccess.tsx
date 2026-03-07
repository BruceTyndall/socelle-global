import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, BarChart3, Users, BookOpen, ShoppingCart, CheckCircle, AlertCircle } from 'lucide-react';
import MainNav from '../../components/MainNav';
import BlockReveal from '../../components/motion/BlockReveal';
import SiteFooter from '../../components/sections/SiteFooter';
import { supabase } from '../../lib/supabase';

/* ══════════════════════════════════════════════════════════════════
   RequestAccess — Wired to Supabase access_requests table
   Funnel: public page → this form → access_requests DB → portal signup
   ══════════════════════════════════════════════════════════════════ */

const BENEFITS = [
  { icon: BarChart3, text: 'Market signals and benchmarks' },
  { icon: Users,     text: 'Peer-set competitive intelligence' },
  { icon: BookOpen,  text: 'Protocol library and CE tracking' },
  { icon: ShoppingCart, text: 'Curated professional marketplace' },
];

const BUSINESS_TYPES = [
  'Salon',
  'Spa',
  'Medspa',
  'Clinic',
  'Brand',
  'Other',
];

type FormState = 'idle' | 'submitting' | 'success' | 'error';

export default function RequestAccess() {
  const [businessName, setBusinessName] = useState('');
  const [yourName, setYourName] = useState('');
  const [email, setEmail] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [referralSource, setReferralSource] = useState('');
  const [formState, setFormState] = useState<FormState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const labelClass = 'block text-sm font-sans font-medium text-graphite mb-1.5';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !businessType) {
      setErrorMessage('Please provide your email and business type.');
      setFormState('error');
      return;
    }
    setFormState('submitting');
    setErrorMessage('');

    const { error } = await supabase
      .from('access_requests')
      .insert({
        business_name: businessName.trim() || null,
        contact_name: yourName.trim() || null,
        email: email.trim().toLowerCase(),
        business_type: businessType,
        referral_source: referralSource.trim() || null,
      });

    if (error) {
      // Duplicate email is a benign condition — treat as success
      if (error.code === '23505') {
        setFormState('success');
      } else {
        setErrorMessage('Something went wrong. Please try again or email hello@socelle.com.');
        setFormState('error');
      }
    } else {
      setFormState('success');
    }
  };

  return (
    <div className="min-h-screen bg-mn-bg font-sans">
      <Helmet>
        <title>Request Access — Socelle</title>
        <meta
          name="description"
          content="Request early access to the Socelle intelligence platform. Professional verification required. Applications reviewed within 48 hours."
        />
        <meta property="og:title" content="Request Access — Socelle" />
        <meta
          property="og:description"
          content="Join the professional beauty intelligence platform. Licensed professionals only."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://socelle.com/request-access" />
        <meta property="og:image" content="https://socelle.com/og-image.svg" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://socelle.com/request-access" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Request Access — Socelle',
          description: 'Request early access to the Socelle intelligence platform for professional beauty operators.',
          url: 'https://socelle.com/request-access',
          isPartOf: { '@type': 'WebSite', url: 'https://socelle.com', name: 'Socelle' },
        })}</script>
      </Helmet>
      <MainNav />

      {/* ── Main Content: Split Layout ────────────────────────────── */}
      <section className="relative pt-28 pb-20 lg:pt-36 lg:pb-28 overflow-hidden">
        {/* Subtle brand photo watermark */}
        <img
          src="/images/brand/photos/23.svg"
          alt=""
          aria-hidden="true"
          className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-[0.04] pointer-events-none select-none hidden lg:block"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">

            {/* ── Left: Content ─────────────────────────────────────── */}
            <div className="lg:sticky lg:top-28">
              <BlockReveal>
                <p className="text-[0.8125rem] tracking-[0.12em] font-medium uppercase text-graphite/40 mb-5">
                  JOIN THE PLATFORM
                </p>
              </BlockReveal>
              <BlockReveal delay={80}>
                <h1 className="font-sans font-semibold text-hero text-graphite mb-7 leading-[1.06] tracking-[-0.025em]">
                  Request early access to Socelle
                </h1>
              </BlockReveal>
              <BlockReveal delay={200}>
                <p className="text-body-lg text-graphite/60 max-w-lg mb-12">
                  Socelle delivers market intelligence, competitive benchmarking,
                  and a curated professional marketplace built exclusively for
                  licensed beauty and aesthetics operators. Access is verified to
                  maintain platform integrity.
                </p>
              </BlockReveal>

              <div className="space-y-5">
                {BENEFITS.map((b, idx) => (
                  <BlockReveal key={b.text} delay={300 + idx * 80}>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
                        <b.icon className="w-5 h-5 text-accent" />
                      </div>
                      <span className="font-sans text-[0.9375rem] text-graphite font-medium">
                        {b.text}
                      </span>
                    </div>
                  </BlockReveal>
                ))}
              </div>
            </div>

            {/* ── Right: Glass Form Card ────────────────────────────── */}
            <BlockReveal delay={150}>
              <div className="bg-white/60 backdrop-blur-[12px] border border-white/30 rounded-3xl p-8 lg:p-10">

                {/* ── Success State ── */}
                {formState === 'success' ? (
                  <div className="text-center py-8">
                    <div className="w-14 h-14 rounded-full bg-signal-up/10 flex items-center justify-center mx-auto mb-5">
                      <CheckCircle className="w-7 h-7 text-signal-up" />
                    </div>
                    <h2 className="font-sans font-semibold text-xl text-graphite mb-3">
                      Request received
                    </h2>
                    <p className="text-graphite/60 font-sans text-[0.9375rem] mb-6">
                      We'll review your application and follow up within 48 hours.
                    </p>
                    <p className="text-[0.8125rem] text-graphite/40 font-sans">
                      Ready to sign up?{' '}
                      <a href="/portal/signup" className="text-accent hover:underline">
                        Create your portal account →
                      </a>
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Error Banner */}
                    {formState === 'error' && errorMessage && (
                      <div className="flex items-start gap-3 p-3.5 rounded-xl bg-signal-down/8 border border-signal-down/15">
                        <AlertCircle className="w-4 h-4 text-signal-down flex-shrink-0 mt-0.5" />
                        <p className="text-sm font-sans text-signal-down">{errorMessage}</p>
                      </div>
                    )}

                    {/* Business Name */}
                    <div>
                      <label htmlFor="ra-business-name" className={labelClass}>
                        Business Name
                      </label>
                      <input
                        id="ra-business-name"
                        type="text"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        placeholder="Luminary Skin Studio"
                        className="mn-input"
                        disabled={formState === 'submitting'}
                      />
                    </div>

                    {/* Your Name */}
                    <div>
                      <label htmlFor="ra-your-name" className={labelClass}>
                        Your Name
                      </label>
                      <input
                        id="ra-your-name"
                        type="text"
                        value={yourName}
                        onChange={(e) => setYourName(e.target.value)}
                        placeholder="Jane Smith"
                        className="mn-input"
                        disabled={formState === 'submitting'}
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="ra-email" className={labelClass}>
                        Email <span className="text-signal-down/80">*</span>
                      </label>
                      <input
                        id="ra-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="jane@yourspa.com"
                        className="mn-input"
                        disabled={formState === 'submitting'}
                      />
                    </div>

                    {/* Business Type */}
                    <div>
                      <label htmlFor="ra-business-type" className={labelClass}>
                        Business Type <span className="text-signal-down/80">*</span>
                      </label>
                      <select
                        id="ra-business-type"
                        required
                        value={businessType}
                        onChange={(e) => setBusinessType(e.target.value)}
                        className="mn-input"
                        disabled={formState === 'submitting'}
                      >
                        <option value="">Select type</option>
                        {BUSINESS_TYPES.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    {/* Referral Source (optional) */}
                    <div>
                      <label htmlFor="ra-referral" className={labelClass}>
                        How did you hear about us?{' '}
                        <span className="text-graphite/40 font-normal">(optional)</span>
                      </label>
                      <input
                        id="ra-referral"
                        type="text"
                        value={referralSource}
                        onChange={(e) => setReferralSource(e.target.value)}
                        placeholder="Colleague, trade show, search..."
                        className="mn-input"
                        disabled={formState === 'submitting'}
                      />
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={formState === 'submitting'}
                      className="w-full btn-mineral-primary disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {formState === 'submitting' ? 'Submitting…' : 'Request Access'}
                      {formState !== 'submitting' && <ArrowRight className="w-4 h-4" />}
                    </button>
                  </form>
                )}

                {formState !== 'success' && (
                  <p className="text-center text-xs text-graphite/40 mt-5">
                    We review applications within 48 hours.
                  </p>
                )}
              </div>
            </BlockReveal>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
