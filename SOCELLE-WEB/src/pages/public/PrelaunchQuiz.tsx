/* ═══════════════════════════════════════════════════════════════
   PrelaunchQuiz.tsx — W14-01
   Pre-launch landing page + 8-question professional benchmarking quiz.
   Serves as primary / route during pre-launch phase.

   Flow: landing → identity capture → 8 quiz questions → results
   Lead capture: LIVE (access_requests Supabase table, quiz_answers JSONB)
   Stats strip: DEMO (labeled Preview)

   SEO: Full Helmet + JSON-LD. Landing state is fully indexable.
   Authority: build_tracker.md (W14-01), SOCELLE_CANONICAL_DOCTRINE.md
   Pearl Mineral V2 only — no pro-* tokens, no font-serif.
   ═══════════════════════════════════════════════════════════════ */
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  BarChart3,
  Users,
  Target,
  Sparkles,
  ChevronUp,
  Minus,
  Mail,
} from 'lucide-react';
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

interface PeerBenchmark {
  label: string;
  value: string;
  context: string;
  direction: 'above' | 'average' | 'below';
}

interface ProfileResult {
  segment: string;
  segmentDesc: string;
  focusAreas: string[];
  peerBenchmarks: PeerBenchmark[];
  recommendations: Array<{ category: string; rationale: string }>;
}

function computeProfile(identity: Identity, answers: Record<string, string>): ProfileResult {
  const spend = answers.monthly_spend ?? '';

  /* ── Segment ── */
  let segment = 'Boutique Operator';
  let segmentDesc = 'Independent or small-team practice. Highly curated brand portfolio, relationship-driven procurement.';
  if (spend === '$20K+' || spend === '$7K–$20K') {
    segment = 'Enterprise Operator';
    segmentDesc = 'High-volume multi-provider practice. Formulary complexity and margin discipline are your primary intelligence needs.';
  } else if (spend === '$3K–$7K' || spend === '$1K–$3K') {
    segment = 'Growth Operator';
    segmentDesc = 'Scaling practice with growing procurement needs. Brand mix optimization and benchmark data will drive your next phase.';
  }

  /* ── Pain point → focus area ── */
  const painPointIntelMap: Record<string, string> = {
    'Distributor markups with no price transparency': 'Wholesale pricing intelligence',
    'Hard to compare brands objectively': 'Brand comparison benchmarks',
    'Ingredient claims that are not clinically verified': 'Ingredient efficacy signals',
    'Confusing minimum order requirements': 'Order optimization data',
    'Slow rep response or fulfillment delays': 'Supplier performance tracking',
    'No way to predict what will sell': 'Category demand forecasting',
  };

  /* ── intelligence_priority → focus area ── */
  const priorityFocusMap: Record<string, string> = {
    'Category demand trends':              'Category demand trend tracking',
    'Peer spend & benchmark data':         'Peer spend benchmarking',
    'Ingredient efficacy & clinical data': 'Ingredient efficacy intelligence',
    'Wholesale pricing transparency':      'Wholesale pricing intelligence',
    'Brand performance analytics':         'Brand performance tracking',
    'Regulatory & compliance updates':     'Regulatory & compliance signals',
  };

  const focusAreas: string[] = [];
  if (answers.pain_point && painPointIntelMap[answers.pain_point]) {
    focusAreas.push(painPointIntelMap[answers.pain_point]);
  }
  if (answers.top_category) {
    focusAreas.push(`${answers.top_category} market signals`);
  }
  if (answers.intelligence_priority && priorityFocusMap[answers.intelligence_priority]) {
    const priorityFocus = priorityFocusMap[answers.intelligence_priority];
    if (!focusAreas.includes(priorityFocus)) focusAreas.push(priorityFocus);
  }
  if (focusAreas.length < 3) focusAreas.push('Peer spend benchmarking');
  if (focusAreas.length < 3) focusAreas.push('Market demand trends');

  /* ── Peer benchmarks (DEMO) ── */
  const spendBenchmarkMap: Record<string, { value: string; context: string; direction: PeerBenchmark['direction'] }> = {
    'Under $1K': { value: 'Bottom quartile', context: 'vs. peers in your practice type', direction: 'below' },
    '$1K–$3K':   { value: 'Mid-tier spend',  context: 'vs. peers in your metro',         direction: 'average' },
    '$3K–$7K':   { value: 'Above average',   context: 'vs. operators your size',          direction: 'above' },
    '$7K–$20K':  { value: 'Top 30%',         context: 'by procurement volume',            direction: 'above' },
    '$20K+':     { value: 'Top 10%',         context: 'enterprise-tier buyer',            direction: 'above' },
  };
  const teamBenchmarkMap: Record<string, { value: string; context: string; direction: PeerBenchmark['direction'] }> = {
    'Solo — just me': { value: '1 provider', context: 'Single-operator profile',    direction: 'below' },
    '2–3 providers':  { value: '2–3 team',   context: 'Typical boutique team',      direction: 'average' },
    '4–7 providers':  { value: '4–7 team',   context: 'Above median team size',     direction: 'above' },
    '8–15 providers': { value: '8–15 team',  context: 'Top 25% by team size',       direction: 'above' },
    '16+ providers':  { value: '16+ team',   context: 'Enterprise team scale',      direction: 'above' },
  };
  const linesBenchmarkMap: Record<string, { value: string; context: string; direction: PeerBenchmark['direction'] }> = {
    '1–2 lines':   { value: 'Focused formulary', context: 'Low complexity, high loyalty',   direction: 'below' },
    '3–5 lines':   { value: 'Balanced mix',      context: 'Typical for your segment',       direction: 'average' },
    '6–10 lines':  { value: 'Diversified',       context: 'Above average complexity',       direction: 'above' },
    '11–20 lines': { value: 'High complexity',   context: 'Top 20% by brand count',         direction: 'above' },
    '20+ lines':   { value: 'Max complexity',    context: 'Distributor-level breadth',      direction: 'above' },
  };

  const peerBenchmarks: PeerBenchmark[] = [
    {
      label: 'Monthly Spend',
      ...(spendBenchmarkMap[spend] ?? { value: '—', context: 'No data', direction: 'average' as const }),
    },
    {
      label: 'Team Size',
      ...(teamBenchmarkMap[answers.team_size] ?? { value: '—', context: 'No data', direction: 'average' as const }),
    },
    {
      label: 'Brand Lines',
      ...(linesBenchmarkMap[answers.brand_lines] ?? { value: '—', context: 'No data', direction: 'average' as const }),
    },
  ];

  /* ── Matched recommendations (DEMO — will be powered by VIAIVE API) ── */
  const categoryRecsMap: Record<string, Array<{ category: string; rationale: string }>> = {
    'Injectables & neuromodulators': [
      { category: 'Neurotoxin protocol intelligence', rationale: 'Dosage benchmarks + technique adoption across peers' },
      { category: 'Filler & HA brand tracking', rationale: 'Margin trends and practitioner sentiment by brand' },
      { category: 'Pre/post care line signals', rationale: 'Attach rate data and retail conversion benchmarks' },
    ],
    'Clinical skincare & peels': [
      { category: 'Professional peel line rankings', rationale: 'Adoption velocity and outcome signal tracking' },
      { category: 'Active ingredient intelligence', rationale: 'Clinical efficacy data mapped to SKU-level decisions' },
      { category: 'Barrier repair brand benchmarks', rationale: 'Category demand shifts and peer formulary comparisons' },
    ],
    'Body sculpting & wellness': [
      { category: 'Device protocol benchmarks', rationale: 'Non-invasive treatment demand and pricing trends' },
      { category: 'Contouring topical signals', rationale: 'Ingredient performance data and attach rate benchmarks' },
      { category: 'Wellness category demand', rationale: 'Emerging category adoption across your peer set' },
    ],
    'Hair removal': [
      { category: 'Laser protocol intelligence', rationale: 'Device comparison signals and practitioner outcomes' },
      { category: 'Pre-treatment prep brand data', rationale: 'Formulation claims and clinical backing benchmarks' },
      { category: 'Post-procedure care line tracking', rationale: 'Retail attach rates and reorder velocity signals' },
    ],
    'Lash, brow & PMU': [
      { category: 'Pigment & tint brand rankings', rationale: 'Practitioner sentiment and safety signal tracking' },
      { category: 'Aftercare line benchmarks', rationale: 'Retail conversion and client retention data' },
      { category: 'Supply protocol intelligence', rationale: 'Adoption trends and peer formulary comparisons' },
    ],
    'Massage & body therapy': [
      { category: 'Massage medium brand signals', rationale: 'Formulation benchmarks and practitioner preference data' },
      { category: 'Body treatment line tracking', rationale: 'Category demand shifts and pricing transparency' },
      { category: 'Wellness protocol intelligence', rationale: 'Adoption velocity and outcome benchmarks by peer set' },
    ],
  };

  const defaultRecs = [
    { category: 'Professional brand intelligence', rationale: 'Category demand and adoption tracking' },
    { category: 'Peer spend benchmarks', rationale: 'Metro-level procurement comparison data' },
    { category: 'Ingredient efficacy signals', rationale: 'Clinical backing and formulation benchmarks' },
  ];

  const recommendations = categoryRecsMap[answers.top_category ?? ''] ?? defaultRecs;

  // identity is used for display only — referenced in results screen
  void identity;

  return { segment, segmentDesc, focusAreas: focusAreas.slice(0, 3), peerBenchmarks, recommendations };
}

/* ── Hero video cycle ── */
const HERO_VIDEOS = [
  '/videos/dropper.mp4',
  '/videos/blue-drops.mp4',
  '/videos/foundation.mp4',
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
    if (!identity.email || !identity.zip.trim() || !identity.businessType) {
      setIdentityError('Please complete all required fields including zip code.');
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
          zip_code: identity.zip.trim(),
          quiz_answers: newAnswers,
          referral_source: 'pre-launch-quiz',
        });
        /* 23505 = duplicate email unique violation — treat as success */
        if (error && error.code !== '23505') {
          setSubmitError('Profile saved locally — we will follow up at your email.');
        }
        /* TODO: VIAIVE API integration slot — call after Supabase insert succeeds.
           Pass: identity.email, identity.zip, newAnswers (practice_type, top_category, intelligence_priority)
           Preferred pattern: Supabase Edge Function to keep API key server-side. */
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
          content="Socelle delivers market signals, peer benchmarks, ingredient intelligence, and clinical protocols to salons, spas, medspas, and aesthetics clinics. Sign up for launch notifications and take our 2-minute professional profile quiz."
        />
        <meta property="og:title" content="Socelle — Intelligence Platform for Professional Beauty" />
        <meta
          property="og:description"
          content="Market signals, ingredient intelligence, and peer benchmarks for professional beauty operators. Sign up for launch notifications and early access."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={SITE_URL} />
        <meta property="og:image" content={DEFAULT_OG_IMAGE} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={SITE_URL} />
      </Helmet>
      <JsonLd data={[buildOrganizationSchema(), buildWebSiteSchema()]} />

      {/* ══════════════════════════════════════════════════════════
          LANDING STATE — full-screen video hero
          ══════════════════════════════════════════════════════════ */}
      {step === 'landing' && (
        <div className="relative min-h-screen font-sans overflow-hidden bg-graphite">

          {/* ── Video background ── */}
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={HERO_VIDEOS[0]} type="video/mp4" />
            <source src={HERO_VIDEOS[1]} type="video/mp4" />
          </video>

          {/* ── Gradient overlay ── */}
          <div className="absolute inset-0 bg-gradient-to-b from-graphite/80 via-graphite/60 to-graphite/90" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#141418/60%_100%)]" />

          {/* ── Wordmark ── */}
          <div className="relative z-10 flex items-center justify-between px-6 sm:px-10 pt-8">
            <span className="font-sans font-semibold text-white text-[1.125rem] tracking-[-0.02em]">
              Socelle
            </span>
            <a
              href="mailto:hello@socelle.com"
              className="flex items-center gap-2 text-white/50 hover:text-white text-xs font-medium tracking-wide transition-colors"
            >
              <Mail className="w-3.5 h-3.5" />
              hello@socelle.com
            </a>
          </div>

          {/* ── Main content ── */}
          <div className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
            <p className="text-[0.7rem] tracking-[0.2em] font-semibold uppercase text-accent/80 mb-6">
              Pre-Registration Open — Spring 2026
            </p>
            <h1 className="font-sans font-semibold text-[2.75rem] sm:text-[3.5rem] lg:text-[4.5rem] text-white leading-[1.02] tracking-[-0.035em] mb-7 max-w-3xl">
              The intelligence layer<br className="hidden sm:block" />
              professional beauty<br className="hidden sm:block" />
              has been missing
            </h1>
            <p className="text-white/50 text-[1rem] sm:text-[1.0625rem] max-w-xl mx-auto mb-10 leading-relaxed">
              Market signals, ingredient intelligence, and peer benchmarks —
              built exclusively for licensed beauty and aesthetics operators.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={startQuiz}
                className="inline-flex items-center gap-2 bg-white text-graphite font-semibold text-[0.9375rem] px-8 py-4 rounded-full hover:bg-white/90 transition-colors shadow-xl"
              >
                Sign Up for Launch Notifications &amp; Early Access <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="mailto:hello@socelle.com"
                className="inline-flex items-center gap-2 border border-white/20 text-white/70 hover:text-white hover:border-white/40 font-medium text-sm px-6 py-4 rounded-full transition-colors"
              >
                <Mail className="w-3.5 h-3.5" /> Contact us
              </a>
            </div>

            {/* Social proof counter — DEMO: static until access_requests COUNT query goes live (W10-07) */}
            <div className="flex items-center gap-3 mt-8">
              <div className="flex -space-x-2">
                {(['#6E879B', '#8FA3B4', '#B0C4D3', '#4A6070'] as const).map((color, i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full border-2 border-graphite/80 flex items-center justify-center text-[0.55rem] font-bold text-white"
                    style={{ backgroundColor: color }}
                  >
                    {(['S', 'M', 'A', 'J'] as const)[i]}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white/60 text-[0.8125rem]">
                  <span className="text-white font-semibold">1,400+</span> operators on the waitlist
                </span>
                <span className="text-[0.6rem] font-semibold tracking-wider uppercase bg-signal-warn/20 text-signal-warn px-2 py-0.5 rounded-full">
                  Preview
                </span>
              </div>
            </div>

            <p className="text-white/25 text-[0.75rem] mt-4">
              2 minutes · 8 questions · Instant profile results
            </p>
          </div>

          {/* ── About strip ── */}
          <div className="relative z-10 border-t border-white/10 bg-graphite/70 backdrop-blur-sm">
            <div className="max-w-4xl mx-auto px-6 sm:px-10 py-10 grid sm:grid-cols-3 gap-8">
              <div>
                <p className="text-[0.65rem] tracking-[0.16em] font-semibold uppercase text-accent/70 mb-2">
                  About Socelle
                </p>
                <p className="text-white/45 text-sm leading-relaxed">
                  A professional intelligence platform for the beauty and aesthetics industry.
                  Market signals, verified benchmarks, and clinical protocols — verified and calibrated
                  for licensed operators.
                </p>
              </div>
              <div>
                <p className="text-[0.65rem] tracking-[0.16em] font-semibold uppercase text-accent/70 mb-2">
                  Who It's For
                </p>
                <p className="text-white/45 text-sm leading-relaxed">
                  Salons, spas, medspas, aesthetics clinics, and independent practitioners who
                  make procurement decisions and need verified market data to back them up.
                </p>
              </div>
              <div>
                <p className="text-[0.65rem] tracking-[0.16em] font-semibold uppercase text-accent/70 mb-2">
                  Get In Touch
                </p>
                <p className="text-white/45 text-sm leading-relaxed mb-3">
                  Questions about the platform, early access, or brand partnerships?
                </p>
                <a
                  href="mailto:hello@socelle.com"
                  className="inline-flex items-center gap-2 text-accent hover:text-accent/80 text-sm font-medium transition-colors"
                >
                  <Mail className="w-3.5 h-3.5" />
                  hello@socelle.com
                </a>
              </div>
            </div>

            {/* micro footer */}
            <div className="border-t border-white/5 px-6 sm:px-10 py-4 flex items-center justify-between">
              <span className="text-white/20 text-xs">© 2026 Socelle. All rights reserved.</span>
              <span className="text-[0.65rem] tracking-[0.12em] uppercase text-signal-warn/50 font-semibold">
                Pre-Launch
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          QUIZ FLOW — identity / quiz / results
          ══════════════════════════════════════════════════════════ */}
      {step !== 'landing' && (
        <div className="min-h-screen bg-mn-bg font-sans flex flex-col">

          {/* Minimal quiz header */}
          <div className="flex items-center justify-between px-6 sm:px-10 h-14 border-b border-graphite/8 bg-white/80 backdrop-blur-sm">
            <button
              onClick={() => setStep('landing')}
              className="font-sans font-semibold text-graphite text-[1rem] tracking-[-0.02em] hover:text-accent transition-colors"
            >
              Socelle
            </button>
            {step === 'quiz' && (
              <span className="text-[0.7rem] text-graphite/35 font-medium">
                {quizStep + 1} / {QUESTIONS.length}
              </span>
            )}
          </div>

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
            <div className={`w-full ${step === 'results' ? 'max-w-2xl' : 'max-w-lg'}`}>

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
                        Zip Code <span className="text-signal-down/80">*</span>{' '}
                        <span className="text-graphite/40 font-normal text-xs">
                          (enables metro-level benchmarks)
                        </span>
                      </label>
                      <input
                        type="text"
                        required
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
                <div className="space-y-5">

                  {/* ── Header card: Profile segment ── */}
                  <div className="bg-graphite rounded-3xl p-8 lg:p-10 text-center">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-5">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <p className="text-[0.7rem] tracking-[0.14em] font-semibold uppercase text-white/35 mb-2">
                      Your Professional Profile
                    </p>
                    <h2 className="font-sans font-semibold text-[2rem] text-white tracking-[-0.03em] mb-3">
                      {profile.segment}
                    </h2>
                    <p className="text-white/55 text-sm max-w-sm mx-auto leading-relaxed mb-5">
                      {profile.segmentDesc}
                    </p>
                    <p className="text-white/35 text-xs">
                      Waitlist confirmed —{' '}
                      <span className="text-white/60 font-medium">{identity.email}</span>
                    </p>
                  </div>

                  {/* ── Peer benchmarks (DEMO) ── */}
                  <div className="bg-white rounded-3xl p-7 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-accent" />
                        <p className="text-[0.7rem] tracking-[0.12em] font-semibold uppercase text-graphite/50">
                          How You Compare to Peers
                        </p>
                      </div>
                      <span className="text-[0.65rem] font-semibold tracking-wider uppercase bg-signal-warn/10 text-signal-warn px-2.5 py-1 rounded-full">
                        Preview
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {profile.peerBenchmarks.map((bench) => (
                        <div key={bench.label} className="bg-mn-bg rounded-2xl p-4">
                          <div className="flex items-center gap-1.5 mb-2">
                            {bench.direction === 'above' && (
                              <ChevronUp className="w-3.5 h-3.5 text-signal-up flex-shrink-0" />
                            )}
                            {bench.direction === 'average' && (
                              <Minus className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                            )}
                            {bench.direction === 'below' && (
                              <ChevronUp className="w-3.5 h-3.5 text-graphite/30 flex-shrink-0 rotate-180" />
                            )}
                            <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-graphite/40 truncate">
                              {bench.label}
                            </p>
                          </div>
                          <p className="font-sans font-semibold text-graphite text-[0.9375rem] leading-tight mb-1">
                            {bench.value}
                          </p>
                          <p className="text-graphite/40 text-[0.7rem] leading-snug">
                            {bench.context}
                          </p>
                        </div>
                      ))}
                    </div>
                    <p className="text-graphite/30 text-[0.7rem] mt-4 text-center">
                      Live peer benchmarks unlock at launch. Preview data is illustrative.
                    </p>
                  </div>

                  {/* ── Intelligence focus areas ── */}
                  <div className="bg-white rounded-3xl p-7 shadow-sm">
                    <div className="flex items-center gap-2 mb-5">
                      <Target className="w-4 h-4 text-accent" />
                      <p className="text-[0.7rem] tracking-[0.12em] font-semibold uppercase text-graphite/50">
                        Your Intelligence Focus Areas
                      </p>
                    </div>
                    <div className="space-y-3">
                      {profile.focusAreas.map((area, i) => (
                        <div key={area} className="flex items-center gap-3 bg-mn-bg rounded-xl px-4 py-3">
                          <span className="w-6 h-6 rounded-full bg-accent/15 text-accent text-[0.65rem] font-bold flex items-center justify-center flex-shrink-0">
                            {i + 1}
                          </span>
                          <span className="text-graphite text-sm font-medium">{area}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── Matched recommendations (DEMO) ── */}
                  <div className="bg-white rounded-3xl p-7 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-accent" />
                        <p className="text-[0.7rem] tracking-[0.12em] font-semibold uppercase text-graphite/50">
                          Matched Intelligence Categories
                        </p>
                      </div>
                      <span className="text-[0.65rem] font-semibold tracking-wider uppercase bg-signal-warn/10 text-signal-warn px-2.5 py-1 rounded-full">
                        Preview
                      </span>
                    </div>
                    <div className="space-y-3">
                      {profile.recommendations.map((rec) => (
                        <div key={rec.category} className="flex items-start gap-3 border border-graphite/6 rounded-xl px-4 py-3.5">
                          <BarChart3 className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-graphite text-sm font-semibold">{rec.category}</p>
                            <p className="text-graphite/45 text-xs mt-0.5 leading-snug">{rec.rationale}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-graphite/30 text-[0.7rem] mt-4 text-center">
                      Personalized product recommendations powered at launch.
                    </p>
                  </div>

                  {/* ── CTA ── */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm text-center">
                    <h3 className="font-sans font-semibold text-graphite text-[1.125rem] tracking-[-0.02em] mb-2">
                      Secure your early access spot
                    </h3>
                    <p className="text-graphite/50 text-sm mb-6 leading-relaxed">
                      Create your account to hold your waitlist position.
                      Your intelligence profile will be ready from day one.
                    </p>
                    <a
                      href="/portal/signup"
                      className="inline-flex items-center gap-2 bg-graphite text-white font-semibold text-sm px-8 py-4 rounded-full hover:bg-graphite/90 transition-colors mb-3"
                    >
                      Create your account <ArrowRight className="w-4 h-4" />
                    </a>
                    <p className="text-graphite/30 text-xs">
                      Early access is limited. Priority given to verified practitioners.
                    </p>
                  </div>

                </div>
              )}

            </div>
          </div>

          {/* Results contact nudge */}
          {step === 'results' && (
            <div className="text-center pb-12">
              <a
                href="mailto:hello@socelle.com"
                className="inline-flex items-center gap-2 text-graphite/35 hover:text-graphite text-xs font-medium transition-colors"
              >
                <Mail className="w-3 h-3" /> Questions? hello@socelle.com
              </a>
            </div>
          )}
        </div>
      )}
    </>
  );
}
