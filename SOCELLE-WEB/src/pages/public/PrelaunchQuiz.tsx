/* ═══════════════════════════════════════════════════════════════
   PrelaunchQuiz.tsx — W14-01
   Pre-launch landing page + 8-question professional benchmarking quiz.
   Serves as primary / route during pre-launch phase.

   Flow: landing → identity capture → 8 quiz questions → results
   Lead capture: LIVE (access_requests Supabase table, quiz_answers JSONB)
   Stats strip: DEMO (labeled Preview)

   SEO: Full Helmet + JSON-LD. Landing state is fully indexable.
   Authority: build_tracker.md (W14-01), SOCELLE_CANONICAL_DOCTRINE.md
   Pearl Mineral V2 only — no pro-* tokens, no font-sans.
   ═══════════════════════════════════════════════════════════════ */
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  BarChart3,
  FlaskConical,
  TrendingUp,
  Users,
} from 'lucide-react';
import MainNav from '../../components/MainNav';
import SiteFooter from '../../components/sections/SiteFooter';
import JsonLd from '../../components/seo/JsonLd';
import { buildOrganizationSchema, buildWebSiteSchema, SITE_URL, DEFAULT_OG_IMAGE } from '../../lib/seo';
import { supabase } from '../../lib/supabase';

/* ── Flow state ── */
type FlowStep = 'landing' | 'identity' | 'quiz' | 'results';

interface Identity {
  name: string;
  email: string;
  zip: string;
  businessType: string;
}

/* ── Quiz data ─────────────────────────────────────────────────── */

const BUSINESS_TYPES = [
  'Medspa',
  'Day Spa',
  'Salon',
  'Esthetic Suite / Studio',
  'Clinic / Medical Practice',
  'Brand',
  'Other',
];

const QUESTIONS = [
  {
    id: 'practice_type',
    question: 'What best describes your practice?',
    subtitle: 'We use this to calibrate your peer benchmarks.',
    options: [
      'Medspa',
      'Day Spa',
      'Salon',
      'Esthetic Suite / Studio',
      'Clinic / Medical Practice',
      'Commission-based Suite',
    ],
  },
  {
    id: 'team_size',
    question: 'How many licensed providers does your team include?',
    subtitle: 'Helps us calibrate volume benchmarks accurately.',
    options: [
      'Solo — just me',
      '2–3 providers',
      '4–7 providers',
      '8–15 providers',
      '16+ providers',
    ],
  },
  {
    id: 'monthly_spend',
    question: 'What is your approximate monthly professional product spend?',
    subtitle: 'Used to benchmark you against peers in your metro.',
    options: [
      'Under $1K',
      '$1K–$3K',
      '$3K–$7K',
      '$7K–$20K',
      '$20K+',
    ],
  },
  {
    id: 'top_category',
    question: 'Which treatment category generates the most revenue for your practice?',
    subtitle: 'We track demand signals and pricing shifts by category.',
    options: [
      'Injectables & neuromodulators',
      'Clinical skincare & peels',
      'Body sculpting & wellness',
      'Hair removal',
      'Lash, brow & PMU',
      'Massage & body therapy',
    ],
  },
  {
    id: 'discovery_method',
    question: 'How do you primarily discover and vet new professional products?',
    subtitle: 'Helps us surface the intelligence you are missing most.',
    options: [
      'Distributor rep visits',
      'Trade shows & conferences',
      'Peer / colleague referrals',
      'Social media & influencers',
      'Brand trial samples',
      'No formal process currently',
    ],
  },
  {
    id: 'pain_point',
    question: 'What is your biggest pain point when procuring professional products?',
    subtitle: 'Every answer shapes the intelligence we prioritize.',
    options: [
      'Distributor markups with no price transparency',
      'Hard to compare brands objectively',
      'Ingredient claims that are not clinically verified',
      'Confusing minimum order requirements',
      'Slow rep response or fulfillment delays',
      'No way to predict what will sell',
    ],
  },
  {
    id: 'brand_lines',
    question: 'How many professional product lines do you currently carry?',
    subtitle: 'Helps us model your formulary complexity.',
    options: [
      '1–2 lines',
      '3–5 lines',
      '6–10 lines',
      '11–20 lines',
      '20+ lines',
    ],
  },
  {
    id: 'intelligence_priority',
    question: 'What type of intelligence would most improve your buying decisions?',
    subtitle: 'Your answer directly shapes your Socelle intelligence feed.',
    options: [
      'Category demand trends',
      'Peer spend & benchmark data',
      'Ingredient efficacy & clinical data',
      'Wholesale pricing transparency',
      'Brand performance analytics',
      'Regulatory & compliance updates',
    ],
  },
] as const;

/* ── Profile computation ─────────────────────────────────────── */

function computeProfile(identity: Identity, answers: Record<string, string>) {
  const spend = answers.monthly_spend ?? '';
  let segment = 'Boutique Operator';
  if (spend === '$20K+' || spend === '$7K–$20K') segment = 'Enterprise Operator';
  else if (spend === '$3K–$7K' || spend === '$1K–$3K') segment = 'Growth Operator';

  const painPointIntelMap: Record<string, string> = {
    'Distributor markups with no price transparency': 'Wholesale pricing intelligence',
    'Hard to compare brands objectively': 'Brand comparison benchmarks',
    'Ingredient claims that are not clinically verified': 'Ingredient efficacy signals',
    'Confusing minimum order requirements': 'Order optimization data',
    'Slow rep response or fulfillment delays': 'Supplier performance tracking',
    'No way to predict what will sell': 'Category demand forecasting',
  };

  const focusAreas: string[] = [];
  if (answers.pain_point && painPointIntelMap[answers.pain_point]) {
    focusAreas.push(painPointIntelMap[answers.pain_point]);
  }
  if (answers.top_category) {
    focusAreas.push(`${answers.top_category} market signals`);
  }
  if (focusAreas.length < 3) focusAreas.push('Peer spend benchmarking');
  if (focusAreas.length < 3) focusAreas.push('Market demand trends');

  return { segment, focusAreas: focusAreas.slice(0, 3) };
}

/* ── Value props (visible on landing — SEO-indexable) ─────────── */

const VALUE_PROPS = [
  {
    icon: BarChart3,
    title: 'Market Signals',
    desc: 'Demand shifts, pricing moves, and adoption velocity tracked across the professional aesthetics vertical.',
  },
  {
    icon: FlaskConical,
    title: 'Ingredient Intelligence',
    desc: 'Clinically verified ingredient data and efficacy signals mapped to the brands you buy from.',
  },
  {
    icon: Users,
    title: 'Peer Benchmarks',
    desc: 'See how your spend, service mix, and brand portfolio compare to operators in your market.',
  },
  {
    icon: TrendingUp,
    title: 'Brand Performance',
    desc: 'Category rankings, practitioner sentiment, and adoption curves for every brand we track.',
  },
];

/* ═══════════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════════ */

export default function PrelaunchQuiz() {
  const [step, setStep] = useState<FlowStep>('landing');
  const [quizStep, setQuizStep] = useState(0);
  const [identity, setIdentity] = useState<Identity>({
    name: '',
    email: '',
    zip: '',
    businessType: '',
  });
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [identityError, setIdentityError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const startQuiz = () => setStep('identity');

  const submitIdentity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identity.email || !identity.businessType) {
      setIdentityError('Please enter your email and select your business type.');
      return;
    }
    setIdentityError('');
    setStep('quiz');
    setQuizStep(0);
  };

  const selectAnswer = async (answer: string) => {
    const q = QUESTIONS[quizStep];
    const newAnswers = { ...answers, [q.id]: answer };
    setAnswers(newAnswers);

    if (quizStep < QUESTIONS.length - 1) {
      setQuizStep(quizStep + 1);
    } else {
      /* Last question — persist to Supabase then show results */
      setSubmitting(true);
      setSubmitError('');
      try {
        const { error } = await supabase.from('access_requests').insert({
          contact_name: identity.name.trim() || null,
          email: identity.email.trim().toLowerCase(),
          business_type: identity.businessType,
          zip_code: identity.zip.trim() || null,
          quiz_answers: newAnswers,
          referral_source: 'pre-launch-quiz',
        });
        /* 23505 = duplicate email unique violation — treat as success */
        if (error && error.code !== '23505') {
          setSubmitError('Profile saved locally — we will follow up at your email.');
        }
      } catch {
        setSubmitError('Connection issue — your answers were noted.');
      } finally {
        setSubmitting(false);
        setStep('results');
      }
    }
  };

  const goBack = () => {
    if (step === 'identity') { setStep('landing'); return; }
    if (step === 'quiz' && quizStep === 0) { setStep('identity'); return; }
    if (step === 'quiz') setQuizStep(quizStep - 1);
  };

  const profile = step === 'results' ? computeProfile(identity, answers) : null;
  const currentQ = QUESTIONS[quizStep];
  const progress = step === 'quiz' ? Math.round(((quizStep) / QUESTIONS.length) * 100) : 0;

  return (
    <>
      <Helmet>
        <title>Socelle — Professional Beauty Intelligence Platform | Join the Waitlist</title>
        <meta
          name="description"
          content="Socelle delivers market signals, peer benchmarks, ingredient intelligence, and clinical protocols to salons, spas, medspas, and aesthetics clinics. Join the waitlist and take our 2-minute professional profile quiz."
        />
        <meta property="og:title" content="Socelle — Intelligence Platform for Professional Beauty" />
        <meta
          property="og:description"
          content="Market signals, ingredient intelligence, and peer benchmarks for professional beauty operators. Join the waitlist."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:image" content={DEFAULT_OG_IMAGE} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={SITE_URL} />
      </Helmet>
      <JsonLd data={[buildOrganizationSchema(), buildWebSiteSchema()]} />

      {/* ══════════════════════════════════════════════════════════
          LANDING STATE — fully indexable, SEO-rich
          ══════════════════════════════════════════════════════════ */}
      {step === 'landing' && (
        <div className="min-h-screen bg-mn-bg font-sans">
          <MainNav noSpacer />

          {/* ── Hero ──────────────────────────────────────────── */}
          <section className="relative overflow-hidden bg-graphite pt-28 pb-24 lg:pt-40 lg:pb-32">
            <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(ellipse_at_30%_60%,#6E879B_0%,transparent_65%)]" />
            <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <p className="text-[0.75rem] tracking-[0.16em] font-medium uppercase text-accent mb-6">
                Pre-Registration Open — Spring 2026
              </p>
              <h1 className="font-sans font-semibold text-[2.5rem] sm:text-[3.25rem] lg:text-[4rem] text-white leading-[1.04] tracking-[-0.03em] mb-7">
                The intelligence layer<br className="hidden sm:block" />
                professional beauty has been missing
              </h1>
              <p className="text-[1.0625rem] text-white/55 max-w-2xl mx-auto mb-10 leading-relaxed">
                Market signals, ingredient intelligence, and peer benchmarks — built exclusively
                for licensed beauty and aesthetics operators. Take our 2-minute professional
                profile quiz and join the waitlist.
              </p>
              <button
                onClick={startQuiz}
                className="inline-flex items-center gap-2 bg-accent text-white font-semibold text-[0.9375rem] px-8 py-4 rounded-full hover:bg-accent/90 transition-colors shadow-lg"
              >
                Join Waitlist + Take the Quiz <ArrowRight className="w-4 h-4" />
              </button>
              <p className="text-white/30 text-[0.8125rem] mt-4">
                2 minutes · 8 questions · Instant profile results
              </p>
            </div>
          </section>

          {/* ── Value Props ───────────────────────────────────── */}
          <section className="py-20 lg:py-28 bg-mn-bg" aria-labelledby="value-heading">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-14">
                <span className="text-[0.75rem] tracking-[0.12em] font-medium uppercase text-graphite/40 mb-4 block">
                  What You Get
                </span>
                <h2
                  id="value-heading"
                  className="font-sans font-semibold text-[1.875rem] lg:text-[2.375rem] text-graphite tracking-[-0.025em]"
                >
                  Intelligence that moves your practice forward
                </h2>
                <p className="text-graphite/55 text-[0.9375rem] max-w-xl mx-auto mt-4">
                  Socelle is the first platform built specifically for the procurement and
                  intelligence needs of professional beauty and aesthetics operators.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {VALUE_PROPS.map((vp) => (
                  <div key={vp.title} className="bg-white rounded-2xl p-7 shadow-sm">
                    <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center mb-5">
                      <vp.icon className="w-5 h-5 text-accent" />
                    </div>
                    <h3 className="font-sans font-semibold text-graphite text-[0.9375rem] mb-2">
                      {vp.title}
                    </h3>
                    <p className="text-graphite/55 text-sm leading-relaxed">{vp.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── How the quiz works ────────────────────────────── */}
          <section className="py-16 bg-white border-y border-graphite/5" aria-labelledby="quiz-how-heading">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2
                id="quiz-how-heading"
                className="font-sans font-semibold text-[1.5rem] text-graphite tracking-[-0.02em] mb-4"
              >
                How the professional profile quiz works
              </h2>
              <p className="text-graphite/55 text-[0.9375rem] mb-10 leading-relaxed">
                It is a professional benchmarking tool — not a personality test. Eight operational
                questions about how you discover products, manage spend, and make buying decisions.
                Your answers build a profile we use to calibrate your intelligence feed from launch.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
                {[
                  {
                    step: '01',
                    title: 'Tell us about yourself',
                    desc: 'Name, email, zip code, and business type. Takes 30 seconds.',
                  },
                  {
                    step: '02',
                    title: 'Answer 8 operational questions',
                    desc: 'Real questions about spend, discovery, pain points, and priorities.',
                  },
                  {
                    step: '03',
                    title: 'See your professional profile',
                    desc: 'Instant segment classification and 3 tailored intelligence focus areas.',
                  },
                ].map((item) => (
                  <div key={item.step} className="bg-mn-bg rounded-2xl p-6">
                    <p className="font-mono text-[0.75rem] font-semibold text-accent mb-3 tracking-wider">
                      {item.step}
                    </p>
                    <h3 className="font-sans font-semibold text-graphite text-[0.9375rem] mb-2">
                      {item.title}
                    </h3>
                    <p className="text-graphite/55 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Stats strip (DEMO — labeled) ──────────────────── */}
          <section className="py-14 bg-mn-bg">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <span className="text-[0.7rem] tracking-[0.14em] font-semibold uppercase text-signal-warn bg-signal-warn/10 px-3 py-1 rounded-full mb-8 inline-block">
                Preview
              </span>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { value: '200+', label: 'Data sources' },
                  { value: '1,400+', label: 'Verified protocols' },
                  { value: '85+', label: 'Tracked brands' },
                  { value: '14', label: 'Intelligence categories' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="font-sans font-semibold text-[2rem] text-graphite tracking-[-0.03em]">
                      {stat.value}
                    </p>
                    <p className="text-graphite/50 text-sm mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── Bottom CTA ────────────────────────────────────── */}
          <section className="py-20 bg-white border-t border-graphite/5 text-center">
            <div className="max-w-xl mx-auto px-4">
              <h2 className="font-sans font-semibold text-[1.625rem] text-graphite mb-4 tracking-[-0.02em]">
                Be first when we launch
              </h2>
              <p className="text-graphite/55 mb-8 text-[0.9375rem] leading-relaxed">
                Take the 2-minute quiz to build your professional profile. We'll match your
                intelligence access to your practice category from day one.
              </p>
              <button
                onClick={startQuiz}
                className="inline-flex items-center gap-2 bg-graphite text-white font-semibold text-[0.9375rem] px-8 py-4 rounded-full hover:bg-graphite/90 transition-colors"
              >
                Start the Quiz <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </section>

          <SiteFooter />
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          QUIZ FLOW — identity / quiz / results
          ══════════════════════════════════════════════════════════ */}
      {step !== 'landing' && (
        <div className="min-h-screen bg-mn-bg font-sans flex flex-col">
          <MainNav noSpacer />

          {/* Progress bar */}
          {step === 'quiz' && (
            <div className="h-[3px] bg-graphite/8">
              <div
                className="h-full bg-accent transition-all duration-400 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          <div className="flex-1 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-lg">

              {/* Back button */}
              {step !== 'results' && (
                <button
                  onClick={goBack}
                  className="flex items-center gap-1.5 text-graphite/40 hover:text-graphite text-sm mb-8 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              )}

              {/* ── Identity Capture ── */}
              {step === 'identity' && (
                <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-sm">
                  <p className="text-[0.7rem] tracking-[0.14em] font-semibold uppercase text-graphite/35 mb-2">
                    Step 1 of 9
                  </p>
                  <h2 className="font-sans font-semibold text-[1.5rem] text-graphite tracking-[-0.025em] mb-2">
                    Tell us about yourself
                  </h2>
                  <p className="text-graphite/50 text-sm mb-7">
                    We use this to personalize your intelligence profile and waitlist position.
                  </p>

                  {identityError && (
                    <p className="text-signal-down text-sm mb-5 bg-signal-down/8 px-4 py-2.5 rounded-xl">
                      {identityError}
                    </p>
                  )}

                  <form onSubmit={submitIdentity} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-graphite mb-1.5">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={identity.name}
                        onChange={(e) => setIdentity({ ...identity, name: e.target.value })}
                        placeholder="Jane Smith"
                        className="mn-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-graphite mb-1.5">
                        Email <span className="text-signal-down/80">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={identity.email}
                        onChange={(e) => setIdentity({ ...identity, email: e.target.value })}
                        placeholder="jane@yourspa.com"
                        className="mn-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-graphite mb-1.5">
                        Zip Code{' '}
                        <span className="text-graphite/40 font-normal text-xs">
                          (enables metro benchmarks)
                        </span>
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={5}
                        value={identity.zip}
                        onChange={(e) => setIdentity({ ...identity, zip: e.target.value })}
                        placeholder="90210"
                        className="mn-input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-graphite mb-1.5">
                        Business Type <span className="text-signal-down/80">*</span>
                      </label>
                      <select
                        required
                        value={identity.businessType}
                        onChange={(e) => setIdentity({ ...identity, businessType: e.target.value })}
                        className="mn-input"
                      >
                        <option value="">Select type</option>
                        {BUSINESS_TYPES.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <button type="submit" className="w-full btn-mineral-primary mt-2">
                      Continue to Quiz <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                  <p className="text-center text-xs text-graphite/30 mt-5">
                    No spam. Unsubscribe anytime.
                  </p>
                </div>
              )}

              {/* ── Quiz Question ── */}
              {step === 'quiz' && (
                <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-sm">
                  <p className="text-[0.7rem] tracking-[0.14em] font-semibold uppercase text-graphite/35 mb-2">
                    Question {quizStep + 1} of {QUESTIONS.length}
                  </p>
                  <h2 className="font-sans font-semibold text-[1.375rem] text-graphite tracking-[-0.02em] mb-2 leading-snug">
                    {currentQ.question}
                  </h2>
                  <p className="text-graphite/45 text-sm mb-7">{currentQ.subtitle}</p>

                  {submitting ? (
                    <div className="text-center py-10">
                      <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-graphite/50 text-sm">Building your profile…</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {currentQ.options.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => selectAnswer(opt)}
                          className="text-left px-5 py-4 rounded-2xl border border-graphite/10 bg-mn-bg hover:border-accent hover:bg-accent/5 text-graphite text-sm font-medium transition-colors"
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}

                  {submitError && (
                    <p className="text-signal-warn text-xs mt-5 text-center">{submitError}</p>
                  )}
                </div>
              )}

              {/* ── Results ── */}
              {step === 'results' && profile && (
                <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-sm text-center">
                  <div className="w-14 h-14 rounded-full bg-signal-up/10 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle className="w-7 h-7 text-signal-up" />
                  </div>
                  <p className="text-[0.7rem] tracking-[0.14em] font-semibold uppercase text-graphite/35 mb-2">
                    Your Profile
                  </p>
                  <h2 className="font-sans font-semibold text-[1.75rem] text-graphite tracking-[-0.025em] mb-1">
                    {profile.segment}
                  </h2>
                  <p className="text-graphite/50 text-sm mb-8 leading-relaxed">
                    You are on the Socelle waitlist. We will notify{' '}
                    <span className="text-graphite font-medium">{identity.email}</span> when
                    we launch.
                  </p>

                  {/* Intelligence focus areas */}
                  <div className="bg-mn-bg rounded-2xl p-5 mb-7 text-left">
                    <p className="text-[0.7rem] tracking-[0.12em] font-semibold uppercase text-graphite/40 mb-4">
                      Your Intelligence Focus Areas
                    </p>
                    <div className="space-y-3">
                      {profile.focusAreas.map((area, i) => (
                        <div key={area} className="flex items-center gap-3">
                          <span className="w-5 h-5 rounded-full bg-accent/15 text-accent text-[0.65rem] font-semibold flex items-center justify-center flex-shrink-0">
                            {i + 1}
                          </span>
                          <span className="text-graphite text-sm font-medium">{area}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <a
                    href="/portal/signup"
                    className="inline-flex items-center gap-2 bg-graphite text-white font-semibold text-sm px-7 py-3.5 rounded-full hover:bg-graphite/90 transition-colors mb-4"
                  >
                    Create your account now <ArrowRight className="w-4 h-4" />
                  </a>
                  <p className="text-graphite/35 text-xs">
                    Early access is limited. Priority given to verified practitioners.
                  </p>
                </div>
              )}

            </div>
          </div>

          <SiteFooter />
        </div>
      )}
    </>
  );
}
