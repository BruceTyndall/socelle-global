import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  FileText,
  Upload,
  Sparkles,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Loader2,
  Shield,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { extractTextFromFile } from '../../lib/documentExtraction';
import { runMenuAnalysis, validateMenuInput } from '../../lib/menuOrchestrator';
import BusinessNav from '../../components/BusinessNav';
import { mapSupabaseError, getUserMessage } from '../../lib/errors';
import { createScopedLogger } from '../../lib/logger';
import { PaywallGate } from '../../components/PaywallGate';
import { checkCreditBalance, ENGINE_CREDIT_COSTS, type CreditCheckResult } from '../../lib/analysis/creditGate';
import { validateInput } from '../../lib/analysis/guardrails';

const log = createScopedLogger('PlanWizard');

interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  is_featured?: boolean;
}

// Steps: 1 = Upload Menu, 2 = Brand Selection, 3 = Review & Analyze
const STEPS = [
  { label: 'Upload Menu' },
  { label: 'Select Brand' },
  { label: 'Analyze' },
];

export default function PlanWizard() {
  const [searchParams] = useSearchParams();
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [selectedBrandId, setSelectedBrandId] = useState<string>('');
  const [menuText, setMenuText] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [extractionError, setExtractionError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [menuQuality, setMenuQuality] = useState<'ok' | 'low'>('ok');
  const [error, setError] = useState('');
  const [creditCheck, setCreditCheck] = useState<CreditCheckResult | null>(null);
  const [creditLoading, setCreditLoading] = useState(false);
  const [guardrailWarnings, setGuardrailWarnings] = useState<string[]>([]);
  const [analysisStep, setAnalysisStep] = useState<string>('');

  // Check credits when entering step 3
  const checkCredits = useCallback(async () => {
    if (!user) return;
    setCreditLoading(true);
    try {
      const result = await checkCreditBalance(user.id, 'menuOrchestrator');
      setCreditCheck(result);
    } catch (err) {
      log.error('Credit check failed', { error: err instanceof Error ? err.message : String(err) });
    } finally {
      setCreditLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBrands();
  }, [user]);

  const fetchBrands = async () => {
    try {
      setBrandsLoading(true);
      const { data, error } = await supabase
        .from('brands')
        .select('id, name, slug, description, status, is_featured')
        .or('is_published.eq.true,status.eq.active')
        .order('is_featured', { ascending: false })
        .order('name');

      if (error) throw error;

      const safeBrands = Array.isArray(data) ? data : [];
      setBrands(safeBrands);

      const preselectedBrand = searchParams.get('brand');
      if (preselectedBrand && safeBrands.length > 0) {
        const brand = safeBrands.find((b) => b.id === preselectedBrand || b.slug === preselectedBrand);
        if (brand) setSelectedBrandId(brand.id);
      } else if (safeBrands.length > 0) {
        const firstBrand = safeBrands[0];
        if (firstBrand) setSelectedBrandId(firstBrand.id);
      }
    } catch (err: unknown) {
      log.error('Error fetching brands', { error: err instanceof Error ? err.message : String(err) });
      const appError = mapSupabaseError(
        err && typeof err === 'object' && 'code' in err
          ? (err as { message?: string; code?: string })
          : { message: err instanceof Error ? err.message : String(err) },
        'fetchBrands'
      );
      setError(appError.userMessage);
    } finally {
      setBrandsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setExtracting(true);
    setExtractionError('');

    const result = await extractTextFromFile(file);

    if (result.success) {
      setMenuText(result.text);
      setExtractionError('');
    } else {
      setExtractionError(result.error || 'Failed to extract text');
    }

    setExtracting(false);
  };

  const handleNext = () => {
    setError('');

    if (step === 1) {
      if (!menuText.trim()) {
        setError('Please enter or upload your service menu to continue.');
        return;
      }
      const validation = validateMenuInput(menuText);
      if (!validation.valid) {
        setError(validation.error!);
        return;
      }

      // Run guardrail input validation preview
      const guardrailCheck = validateInput(menuText, 'menuOrchestrator');
      if (guardrailCheck.blocked) {
        setError(guardrailCheck.blockReason ?? 'Input blocked by safety guardrails.');
        return;
      }
      setGuardrailWarnings(guardrailCheck.warnings);

      setMenuQuality(validation.quality as 'ok' | 'low');
      setStep(2);
    } else if (step === 2) {
      if (!selectedBrandId) {
        setError('Please select a brand to continue.');
        return;
      }
      // Check credits before showing step 3
      checkCredits();
      setStep(3);
    }
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };

  const handleAnalyze = async () => {
    if (!user || !selectedBrandId || !menuText.trim()) {
      setError('Missing required information');
      return;
    }

    setProcessing(true);
    setError('');
    setAnalysisStep('Preparing analysis...');

    try {
      const selectedBrand = brands.find((b) => b.id === selectedBrandId);
      const planName = `Menu Fit — ${selectedBrand?.name} · ${new Date().toLocaleDateString()}`;

      setAnalysisStep('Creating analysis plan...');
      const { data: plan, error: planError } = await supabase
        .from('plans')
        .insert({
          business_user_id: user.id,
          brand_id: selectedBrandId,
          name: planName,
          status: 'processing',
        })
        .select()
        .single();

      if (planError) throw planError;

      setAnalysisStep('Uploading menu data...');
      const { error: menuUploadError } = await supabase.from('menu_uploads').insert({
        plan_id: plan.id,
        source_type: uploadedFile ? (uploadedFile.name.endsWith('.pdf') ? 'pdf' : 'docx') : 'paste',
        file_path: uploadedFile?.name || null,
        raw_text: menuText,
        parsed_services: null,
      });
      if (menuUploadError) throw menuUploadError;

      setAnalysisStep('Running AI analysis with live market signals...');
      await runMenuAnalysis(plan.id, selectedBrandId, menuText);

      // Poll until the plan row reflects status='ready' to confirm all
      // outputs were persisted before navigating. Prevents the empty-state
      // race condition where the results page loads before saveOutputs commits.
      const MAX_POLLS = 10;
      const POLL_INTERVAL_MS = 600;
      let confirmed = false;
      for (let i = 0; i < MAX_POLLS; i++) {
        const { data: check } = await supabase
          .from('plans')
          .select('status')
          .eq('id', plan.id)
          .single();
        if (check?.status === 'ready') {
          confirmed = true;
          break;
        }
        await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
      }

      if (!confirmed) {
        throw new Error('Analysis timed out. Please try again.');
      }

      navigate(`/portal/plans/${plan.id}`, { state: { menuQuality } });
    } catch (err) {
      log.error('Error creating plan', { error: err instanceof Error ? err.message : String(err) });
      setError(getUserMessage(err));
      setProcessing(false);
    }
  };

  const selectedBrand = brands.find((b) => b.id === selectedBrandId);
  const serviceCount = menuText.split('\n').filter((l) => l.trim()).length;

  return (
    <>
      <BusinessNav />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ── Header ── */}
        <div className="mb-8">
          <h1 className="text-2xl font-sans font-semibold text-pro-charcoal tracking-tight mb-1">
            Upload Menu &amp; See Brand Fit
          </h1>
          <p className="text-sm text-pro-warm-gray font-sans">
            Upload your service menu and discover how professional brands fit your business
          </p>
        </div>

        <PaywallGate feature="plan_wizard">

        {/* ── Step indicator ── */}
        <div className="flex items-center gap-0 mb-8">
          {STEPS.map((s, idx) => {
            const n = idx + 1;
            const done = n < step;
            const active = n === step;
            return (
              <div key={s.label} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold font-sans transition-colors ${
                      done
                        ? 'bg-pro-charcoal text-white'
                        : active
                        ? 'bg-pro-charcoal text-white'
                        : 'bg-pro-stone text-pro-warm-gray'
                    }`}
                  >
                    {done ? <CheckCircle className="w-4 h-4" /> : n}
                  </div>
                  <span
                    className={`mt-1.5 text-[11px] font-sans whitespace-nowrap ${
                      active ? 'text-pro-charcoal font-medium' : 'text-pro-warm-gray'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-px mx-3 mb-5 transition-colors ${
                      done ? 'bg-pro-charcoal' : 'bg-pro-stone'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* ── Card ── */}
        <div className="bg-white rounded-xl border border-pro-stone p-7 sm:p-9">

          {brandsLoading && step === 2 && (
            <div className="mb-6 flex items-center gap-3 text-pro-warm-gray bg-pro-ivory border border-pro-stone rounded-lg px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
              <span className="text-sm font-medium">Loading available brands…</span>
            </div>
          )}

          {!brandsLoading && brands.length === 0 && step === 2 && (
            <div className="mb-6 p-4 rounded-lg border border-amber-200 bg-amber-50 text-amber-900 text-sm">
              No active brands are currently available for plan generation.
            </div>
          )}

          {/* ── Step 1: Menu Upload ── */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-pro-ivory rounded-lg flex items-center justify-center border border-pro-stone">
                  <FileText className="w-5 h-5 text-pro-charcoal" />
                </div>
                <div>
                  <h2 className="text-base font-sans font-semibold text-pro-charcoal">Your Service Menu</h2>
                  <p className="text-xs text-pro-warm-gray mt-0.5">Upload a file or paste your menu text below</p>
                </div>
              </div>

              {/* Drop zone */}
              <label className="block border-2 border-dashed border-pro-stone rounded-xl p-8 text-center cursor-pointer hover:border-pro-charcoal/30 hover:bg-pro-ivory/50 transition-colors">
                <Upload className="w-8 h-8 text-pro-warm-gray mx-auto mb-3" />
                <p className="text-sm font-medium text-pro-charcoal mb-1">Upload PDF or DOCX</p>
                <p className="text-xs text-pro-warm-gray">Drag and drop, or click to browse</p>
                <input
                  type="file"
                  accept=".pdf,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {uploadedFile && (
                <div className="flex items-center gap-3 p-3 bg-pro-ivory rounded-lg border border-pro-stone">
                  <FileText className="w-5 h-5 text-pro-charcoal flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-pro-charcoal truncate">{uploadedFile.name}</p>
                    {extracting && <p className="text-xs text-pro-warm-gray mt-0.5">Extracting text…</p>}
                  </div>
                  {extracting
                    ? <Loader2 className="w-4 h-4 text-pro-warm-gray animate-spin flex-shrink-0" />
                    : <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  }
                </div>
              )}

              {extractionError && (
                <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{extractionError}</p>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-pro-stone" />
                <span className="text-xs text-pro-warm-gray font-sans font-medium">or paste below</span>
                <div className="flex-1 h-px bg-pro-stone" />
              </div>

              <div>
                <textarea
                  value={menuText}
                  onChange={(e) => setMenuText(e.target.value)}
                  rows={11}
                  className="w-full px-4 py-3 border border-pro-stone rounded-lg focus:ring-2 focus:ring-pro-charcoal focus:border-pro-charcoal font-mono text-sm resize-none transition-shadow"
                  placeholder={"Paste your service menu here…\n\nExample:\nSignature Facial — 60 min — $120\nDeep Cleansing Facial — 75 min — $150\nBody Massage — 60 min — $100"}
                />
                <p className="text-xs text-pro-warm-gray mt-1.5">
                  {menuText.length > 0
                    ? `${serviceCount} line${serviceCount !== 1 ? 's' : ''} · ${menuText.length} characters`
                    : 'Paste your full menu including service names, durations, and prices for best results'}
                </p>
              </div>
            </div>
          )}

          {/* ── Step 2: Brand Selection ── */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-pro-ivory rounded-lg flex items-center justify-center border border-pro-stone">
                  <Sparkles className="w-5 h-5 text-pro-charcoal" />
                </div>
                <div>
                  <h2 className="text-base font-sans font-semibold text-pro-charcoal">Choose a Brand</h2>
                  <p className="text-xs text-pro-warm-gray mt-0.5">Select the professional brand to analyze against</p>
                </div>
              </div>

              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {brands.map((brand) => (
                  <label
                    key={brand.id}
                    className={`flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
                      selectedBrandId === brand.id
                        ? 'border-pro-charcoal bg-pro-ivory'
                        : 'border-pro-stone hover:border-pro-charcoal/30 hover:bg-pro-ivory/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="brand"
                      value={brand.id}
                      checked={selectedBrandId === brand.id}
                      onChange={(e) => setSelectedBrandId(e.target.value)}
                      className="mt-1 accent-pro-charcoal"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-pro-charcoal font-sans">{brand.name}</p>
                        {brand.is_featured && (
                          <span className="inline-flex items-center px-2 py-0.5 bg-pro-gold/15 text-pro-gold text-[10px] font-semibold tracking-wider uppercase rounded-full border border-pro-gold/30">
                            Featured
                          </span>
                        )}
                      </div>
                      {brand.description && (
                        <p className="text-xs text-pro-warm-gray mt-0.5 leading-relaxed">{brand.description}</p>
                      )}
                    </div>
                    {selectedBrandId === brand.id && (
                      <CheckCircle className="w-4 h-4 text-pro-charcoal flex-shrink-0 mt-0.5" />
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 3: Review & Analyze ── */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-pro-ivory rounded-lg flex items-center justify-center border border-pro-stone">
                  <Sparkles className="w-5 h-5 text-pro-charcoal" />
                </div>
                <div>
                  <h2 className="text-base font-sans font-semibold text-pro-charcoal">Ready to Analyze</h2>
                  <p className="text-xs text-pro-warm-gray mt-0.5">Review your selections and run the analysis</p>
                </div>
              </div>

              <div className="divide-y divide-pro-stone border border-pro-stone rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 bg-white">
                  <p className="text-xs font-medium text-pro-warm-gray uppercase tracking-wider">Business</p>
                  <p className="text-sm font-semibold text-pro-charcoal font-sans">
                    {profile?.spa_name || 'Your Business'}
                  </p>
                </div>
                <div className="flex items-center justify-between px-5 py-4 bg-white">
                  <p className="text-xs font-medium text-pro-warm-gray uppercase tracking-wider">Brand</p>
                  <p className="text-sm font-semibold text-pro-charcoal font-sans">{selectedBrand?.name}</p>
                </div>
                <div className="flex items-center justify-between px-5 py-4 bg-white">
                  <p className="text-xs font-medium text-pro-warm-gray uppercase tracking-wider">Menu</p>
                  <p className="text-sm text-pro-charcoal font-sans">
                    {serviceCount} line{serviceCount !== 1 ? 's' : ''} · {menuText.length.toLocaleString()} chars
                  </p>
                </div>
                <div className="flex items-center justify-between px-5 py-4 bg-white">
                  <p className="text-xs font-medium text-pro-warm-gray uppercase tracking-wider">Credits</p>
                  <div className="flex items-center gap-2">
                    {creditLoading ? (
                      <Loader2 className="w-3 h-3 animate-spin text-pro-warm-gray" />
                    ) : creditCheck ? (
                      <>
                        <CreditCard className="w-3.5 h-3.5 text-pro-warm-gray" />
                        <p className={`text-sm font-sans ${creditCheck.sufficient ? 'text-pro-charcoal' : 'text-red-600 font-medium'}`}>
                          {creditCheck.sufficient
                            ? `${ENGINE_CREDIT_COSTS.menuOrchestrator} credits will be used`
                            : `Insufficient credits (need ${creditCheck.requiredCredits}, have ${creditCheck.currentBalance})`
                          }
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-pro-warm-gray font-sans">Checking...</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Guardrail warnings */}
              {guardrailWarnings.length > 0 && (
                <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Shield className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Safety Notice</p>
                  </div>
                  <ul className="space-y-1">
                    {guardrailWarnings.map((w, i) => (
                      <li key={i} className="text-xs text-amber-700">{w}</li>
                    ))}
                  </ul>
                  <p className="text-xs text-amber-600 mt-2">
                    A licensed provider review notice will be included in the output.
                  </p>
                </div>
              )}

              {/* AI disclosure */}
              <div className="mt-3 flex items-center gap-2 text-xs text-pro-warm-gray">
                <Shield className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Generated by AI — results are for business planning only, not medical advice.</span>
              </div>

              {processing ? (
                <div className="rounded-xl border border-pro-stone bg-pro-ivory p-7">
                  <div className="flex items-center gap-3 mb-5">
                    <Loader2 className="w-5 h-5 text-pro-charcoal animate-spin flex-shrink-0" />
                    <p className="text-sm font-semibold text-pro-charcoal font-sans">Analyzing your menu…</p>
                  </div>
                  {analysisStep && (
                    <p className="text-xs font-medium text-pro-charcoal mb-3 pl-8">{analysisStep}</p>
                  )}
                  <ul className="space-y-2 pl-8 text-sm text-pro-warm-gray list-none">
                    {[
                      'Checking safety guardrails',
                      'Parsing service offerings',
                      'Querying live market signals',
                      'Matching to brand protocols',
                      'Identifying gaps and opportunities',
                      'Generating recommendations',
                      'Deducting credits',
                    ].map((s) => (
                      <li key={s} className="flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-pro-warm-gray" />
                        {s}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-pro-warm-gray mt-5">This typically takes 10–30 seconds</p>
                </div>
              ) : (
                <div className="rounded-xl border border-pro-stone bg-pro-ivory px-5 py-4">
                  <p className="text-sm text-pro-warm-gray">
                    Click <span className="font-medium text-pro-charcoal">Analyze Menu</span> to start.
                    Results include protocol matches, gap analysis, retail attach opportunities, and a phased rollout plan.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Error ── */}
          {error && (
            <div className="mt-5 flex items-start gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* ── Navigation ── */}
          <div className="flex justify-between mt-8 pt-6 border-t border-pro-stone">
            <button
              onClick={handleBack}
              disabled={step === 1 || processing}
              className="px-5 py-2 text-sm font-medium font-sans text-pro-warm-gray rounded-lg hover:bg-pro-stone/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Back
            </button>

            {step < 3 ? (
              <button
                onClick={handleNext}
                disabled={brandsLoading || (step === 2 && brands.length === 0)}
                className="flex items-center gap-2 px-6 py-2.5 bg-pro-charcoal text-white text-sm font-medium font-sans rounded-lg hover:bg-pro-charcoal/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleAnalyze}
                disabled={processing}
                className="flex items-center gap-2 px-6 py-2.5 bg-pro-charcoal text-white text-sm font-medium font-sans rounded-lg hover:bg-pro-charcoal/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing…
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Analyze Menu
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        </PaywallGate>
      </div>
    </>
  );
}
