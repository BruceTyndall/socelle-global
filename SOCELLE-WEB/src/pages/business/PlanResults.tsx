import { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import {
  FileText,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Package,
  BookOpen,
  Loader2,
  ArrowLeft,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import { runMenuAnalysis } from '../../lib/menuOrchestrator';
import BusinessNav from '../../components/BusinessNav';
import UpgradeGate from '../../components/UpgradeGate';
import { getBrandIntelligenceContext } from '../../lib/intelligence/businessIntelligence';
import { Brain } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  status: string;
  brand_id: string;
  created_at: string;
  brands: {
    name: string;
    slug: string;
  };
}

interface PlanOutputs {
  overview?: any;
  protocol_matches?: any;
  gaps?: any;
  retail_attach?: any;
  activation_assets?: any;
}

export default function PlanResults() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const menuQualityWarning = (location.state as any)?.menuQuality === 'low';
  const { user } = useAuth();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [outputs, setOutputs] = useState<PlanOutputs>({});
  const [menuUpload, setMenuUpload] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchPlanData();
    }
  }, [id]);

  // Poll every 3s while plan is processing — stops when status leaves 'processing'
  useEffect(() => {
    if (!plan || plan.status !== 'processing') return;

    const startTime = Date.now();
    const TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes

    const interval = setInterval(async () => {
      if (Date.now() - startTime > TIMEOUT_MS) {
        clearInterval(interval);
        setError('Analysis timed out after 3 minutes. Please try reanalyzing.');
        return;
      }
      await fetchPlanData(false);
    }, 3000);

    return () => clearInterval(interval);
  }, [plan?.status]);

  const fetchPlanData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);

      const { data: planData, error: planError } = await supabase
        .from('plans')
        .select('*, brands(name, slug)')
        .eq('id', id)
        .single();

      if (planError) throw planError;

      // Ownership check: ensure the plan belongs to the current user
      if (planData.business_user_id && user && planData.business_user_id !== user.id) {
        throw new Error('You do not have permission to view this plan');
      }

      setPlan(planData);

      const { data: uploadsData, error: uploadsError } = await supabase
        .from('menu_uploads')
        .select('*')
        .eq('plan_id', id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (uploadsError) throw uploadsError;
      setMenuUpload(uploadsData);

      const { data: outputsData, error: outputsError } = await supabase
        .from('business_plan_outputs')
        .select('*')
        .eq('plan_id', id);

      if (outputsError) throw outputsError;

      const outputsMap: PlanOutputs = {};
      for (const output of outputsData || []) {
        (outputsMap as any)[output.output_type] = output.output_data;
      }
      setOutputs(outputsMap);
    } catch (err) {
      console.error('Error fetching plan:', err);
      setError(err instanceof Error ? err.message : 'Failed to load report');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleReanalyze = async () => {
    if (!plan || !menuUpload) return;

    setReanalyzing(true);
    setError('');

    try {
      await supabase
        .from('business_plan_outputs')
        .delete()
        .eq('plan_id', plan.id);

      await supabase
        .from('plans')
        .update({ status: 'processing' })
        .eq('id', plan.id);

      await runMenuAnalysis(plan.id, plan.brand_id, menuUpload.raw_text);

      await fetchPlanData();
    } catch (err) {
      console.error('Error reanalyzing:', err);
      setError(err instanceof Error ? err.message : 'Failed to reanalyze');
    } finally {
      setReanalyzing(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'protocol_matches', label: 'Protocol Matches', icon: CheckCircle },
    { id: 'gaps', label: 'Gaps & Opportunities', icon: TrendingUp },
    { id: 'retail_attach', label: 'Retail Attach', icon: Package },
    { id: 'activation_assets', label: 'Activation Kit', icon: BookOpen },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-graphite animate-spin" />
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <h2 className="text-2xl font-sans font-semibold text-graphite mb-2">Error Loading Report</h2>
        <p className="text-graphite/60 font-sans mb-4">{error || 'Report not found'}</p>
        <Link
          to="/portal/plans"
          className="inline-flex items-center gap-2 text-graphite/60 hover:text-graphite font-medium font-sans transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Reports
        </Link>
      </div>
    );
  }

  const hasOutputs = Object.keys(outputs).length > 0;

  return (
    <>
      <BusinessNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link
              to="/portal/plans"
              className="inline-flex items-center gap-2 text-sm text-graphite/60 hover:text-graphite font-medium font-sans transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Reports
            </Link>
            <h1 className="text-2xl font-sans font-semibold text-graphite tracking-tight">{plan.name}</h1>
            <p className="text-sm text-graphite/60 font-sans mt-1">
              {plan.brands?.name} · {new Date(plan.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>

        <div className="flex items-center gap-3">
          <div
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              plan.status === 'ready'
                ? 'bg-green-100 text-green-800'
                : plan.status === 'processing'
                ? 'bg-accent-soft text-graphite'
                : plan.status === 'error'
                ? 'bg-red-100 text-red-800'
                : 'bg-accent-soft text-graphite'
            }`}
          >
            {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
          </div>

          {hasOutputs && plan.status !== 'processing' && (
            <button
              onClick={handleReanalyze}
              disabled={reanalyzing}
              className="flex items-center gap-2 px-4 py-2 border border-accent-soft rounded-lg text-graphite hover:bg-background disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${reanalyzing ? 'animate-spin' : ''}`} />
              {reanalyzing ? 'Reanalyzing...' : 'Reanalyze'}
            </button>
          )}
        </div>
      </div>

      {plan.status === 'processing' && (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-10 h-10 text-graphite animate-spin" />
          <p className="text-lg font-sans font-medium text-graphite">Analyzing your menu…</p>
          <p className="text-sm font-sans text-graphite/60">This usually takes 20–40 seconds. Hang tight.</p>
        </div>
      )}

      {!hasOutputs && plan.status === 'ready' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-yellow-900 font-medium">No results found</p>
              <p className="text-yellow-800 text-sm mt-1">
                This plan doesn't have any analysis results. Click reanalyze to generate them.
              </p>
              <button
                onClick={handleReanalyze}
                disabled={reanalyzing}
                className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 text-sm font-medium"
              >
                {reanalyzing ? 'Analyzing...' : 'Run Analysis'}
              </button>
            </div>
          </div>
        </div>
      )}

      {hasOutputs && plan.status !== 'processing' && (
        <>
          {menuQualityWarning && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-amber-900 font-medium font-sans text-sm">Menu quality notice</p>
                  <p className="text-amber-800 text-sm mt-1 font-sans leading-relaxed">
                    Your menu had fewer services than usual — results may be limited. For better matches, add more service names, durations, and prices, then reanalyze.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="border-b border-accent-soft">
            <nav className="flex space-x-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-graphite text-graphite'
                        : 'border-transparent text-graphite/60 hover:text-graphite hover:border-accent-soft'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="bg-white rounded-lg border border-accent-soft p-6">
            {/* Overview tab is FREE — this is the wow moment (gap score + service count) */}
            {activeTab === 'overview' && <OverviewTab data={outputs.overview} brand={plan?.brands} />}

            {/* Premium tabs — gated behind Pro subscription */}
            {activeTab === 'protocol_matches' && (
              <UpgradeGate feature="protocol_matches">
                <ProtocolMatchesTab data={outputs.protocol_matches} />
              </UpgradeGate>
            )}
            {activeTab === 'gaps' && (
              <UpgradeGate feature="gap_detail">
                <GapsTab data={outputs.gaps} />
              </UpgradeGate>
            )}
            {activeTab === 'retail_attach' && (
              <UpgradeGate feature="retail_attach">
                <RetailAttachTab data={outputs.retail_attach} />
              </UpgradeGate>
            )}
            {activeTab === 'activation_assets' && (
              <UpgradeGate feature="activation_assets">
                <ActivationAssetsTab data={outputs.activation_assets} />
              </UpgradeGate>
            )}
          </div>

          {/* ── WO-11: Intelligence Context ────────────────────── */}
          <IntelligenceContextSection brandName={plan?.brands?.name} />
        </>
      )}
      </div>
    </>
  );
}

function IntelligenceContextSection({ brandName }: { brandName?: string }) {
  if (!brandName) return null;

  const contexts = getBrandIntelligenceContext([brandName]);
  if (contexts.length === 0) return null;

  const context = contexts[0];

  const trendBadge: Record<string, { label: string; cls: string }> = {
    rising: { label: 'Rising', cls: 'bg-emerald-500/10 text-emerald-600' },
    stable: { label: 'Stable', cls: 'bg-accent-soft text-graphite/60' },
    declining: { label: 'Declining', cls: 'bg-red-50 text-red-600' },
  };

  const badge = trendBadge[context.trendingStatus] || trendBadge.stable;

  return (
    <section className="mt-8 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-intel-dark flex items-center justify-center">
          <Brain className="w-4 h-4 text-intel-accent" />
        </div>
        <div>
          <h3 className="font-sans font-semibold text-graphite text-base">Intelligence Context</h3>
          <p className="text-xs text-graphite/60 font-sans">Platform intelligence for this brand match</p>
        </div>
      </div>

      <div className="bg-graphite rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h4 className="font-sans font-semibold text-white text-sm">{context.brandName}</h4>
            <p className="text-xs text-accent-soft/70 font-sans mt-0.5">
              {context.peerAdoptionCount.toLocaleString()} professional accounts on Socelle
            </p>
          </div>
          <span className={`text-[10px] font-sans font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${badge.cls}`}>
            {badge.label}
          </span>
        </div>
        <p className="text-sm text-accent-soft/90 font-sans leading-relaxed">{context.signalSummary}</p>
      </div>
    </section>
  );
}

function OverviewTab({ data, brand }: { data: any; brand?: { name: string; slug: string } }) {
  if (!data) return <EmptyState />;

  const estimatedMonthlyGap = data.gapOpportunities
    ? Math.round(data.gapOpportunities * 380)
    : 0;
  const matchRate = data.totalServices > 0
    ? Math.round((data.servicesWithMatches / data.totalServices) * 100)
    : 0;

  return (
    <div className="space-y-8">
      {/* ── Section 1: Hero Revenue Gap ── */}
      {estimatedMonthlyGap > 0 && (
        <div className="relative overflow-hidden rounded-xl bg-graphite p-8 md:p-10">
          {/* Subtle texture */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
          <div className="relative">
            <p className="text-label text-accent-soft mb-3 tracking-widest">Estimated monthly revenue gap</p>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-sm font-sans text-accent-soft/60">~$</span>
              <span className="text-metric-xl font-sans text-white tracking-tight">{estimatedMonthlyGap.toLocaleString()}</span>
              <span className="text-base font-sans text-accent-soft/60 ml-1">/month</span>
            </div>
            <div className="h-px bg-white/10 mb-4" />
            <p className="text-sm font-sans text-accent-soft/80 max-w-lg leading-relaxed">
              {data.gapOpportunities} unmatched protocol {data.gapOpportunities === 1 ? 'opportunity' : 'opportunities'} detected across your service menu.
              Each represents recoverable revenue through optimized brand-protocol alignment.
            </p>
            {brand?.slug && (
              <div className="mt-5 flex items-center gap-3">
                <Link
                  to={`/portal/brands/${brand.slug}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-graphite text-sm font-medium font-sans rounded-lg hover:bg-background transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Shop {brand.name}
                </Link>
                <span className="text-xs font-sans text-accent-soft/60">
                  Browse protocols &amp; products to close this gap
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Section 2: Three metrics — structured grid ── */}
      <div className="grid md:grid-cols-3 gap-px bg-brand-border rounded-xl overflow-hidden border border-brand-border">
        <div className="bg-white p-6">
          <p className="text-label text-graphite/60 mb-2 tracking-widest">Services analyzed</p>
          <p className="text-metric-lg font-sans text-graphite">{data.totalServices}</p>
        </div>
        <div className="bg-white p-6">
          <p className="text-label text-graphite/60 mb-2 tracking-widest">Protocol match rate</p>
          <p className="text-metric-lg font-sans text-graphite">{matchRate}<span className="text-lg text-graphite/60">%</span></p>
        </div>
        <div className="bg-white p-6">
          <p className="text-label text-graphite/60 mb-2 tracking-widest">Revenue gaps</p>
          <p className="text-metric-lg font-sans text-graphite">{data.gapOpportunities}</p>
        </div>
      </div>

      {/* ── Section 3: Brand Fit — progress indicator ── */}
      <div className="panel p-6">
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <p className="text-label text-graphite/60 mb-1 tracking-widest">Brand fit score</p>
            <p className="text-sm font-sans text-graphite/60">
              {data.brandFitScore >= 70 ? 'Strong alignment' : data.brandFitScore >= 40 ? 'Moderate alignment' : 'Significant opportunities'} with selected brand protocols
            </p>
          </div>
          <span className="text-metric-md font-sans text-graphite">{data.brandFitScore}%</span>
        </div>
        <div className="w-full bg-accent-soft rounded-sm h-2">
          <div
            className={`h-2 rounded-sm transition-all duration-700 ease-out ${
              data.brandFitScore >= 70
                ? 'bg-emerald-600'
                : data.brandFitScore >= 40
                ? 'bg-accent'
                : 'bg-graphite'
            }`}
            style={{ width: `${data.brandFitScore}%` }}
          />
        </div>
      </div>

      {/* ── Section 4: Service breakdown ── */}
      <div>
        <div className="flex items-baseline justify-between mb-4">
          <h3 className="font-sans font-semibold text-graphite text-base">Menu Analysis</h3>
          <span className="text-sm font-sans text-graphite/60">{data.totalServices} services detected</span>
        </div>
        <div className="divide-y divide-brand-border rounded-xl border border-brand-border overflow-hidden">
          {data.services.map((service: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between px-5 py-3.5 bg-white hover:bg-brand-surface-alt transition-colors duration-100">
              <div className="flex-1 min-w-0">
                <p className="font-sans font-medium text-sm text-graphite truncate">{service.name}</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-sans text-graphite/60 ml-4 flex-shrink-0">
                {service.category && <span className="hidden sm:inline">{service.category}</span>}
                {service.duration && <span>{service.duration}m</span>}
                {service.price && <span className="font-medium text-graphite">${service.price}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProtocolMatchesTab({ data }: { data: any }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-graphite/60">No protocol matches found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-graphite mb-4">
        Protocol Matches ({data.length})
      </h2>
      {data.map((match: any, idx: number) => (
        <div key={idx} className="p-4 bg-background rounded-lg border border-accent-soft">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <p className="font-medium text-graphite">{match.service.name}</p>
              <p className="text-sm text-graphite/60 mt-1">
                Matched to: <span className="font-medium text-graphite">{match.protocol.name}</span>
              </p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-green-600">{match.matchScore}%</div>
              <div className="text-xs text-graphite/60">Match Score</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {match.matchReasons.map((reason: string, ridx: number) => (
              <span
                key={ridx}
                className="px-2 py-1 bg-accent-soft text-graphite text-xs rounded-full"
              >
                {reason}
              </span>
            ))}
          </div>
          {match.protocol.description && (
            <p className="text-sm text-graphite/60 mt-3 pt-3 border-t border-accent-soft">
              {match.protocol.description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function GapsTab({ data }: { data: any }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-graphite/60">No gaps identified</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-graphite mb-4">
        Gap Opportunities ({data.length})
      </h2>
      <p className="text-graphite/60 mb-4">
        These protocols are not currently offered in your menu but could be valuable additions.
      </p>
      {data.map((gap: any, idx: number) => (
        <div key={idx} className="p-4 bg-orange-50 rounded-lg border border-orange-200">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <p className="font-medium text-graphite">{gap.protocol.name}</p>
              <p className="text-sm text-graphite/60 mt-1">{gap.reason}</p>
            </div>
            {gap.estimatedRevenue && (
              <div className="text-right">
                <div className="text-lg font-bold text-orange-600">
                  ${gap.estimatedRevenue}
                </div>
                <div className="text-xs text-graphite/60">Est. Price</div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-graphite/60 mt-3 pt-3 border-t border-orange-200">
            <span>Category: {gap.protocol.category}</span>
            <span>Duration: {gap.protocol.duration} min</span>
          </div>
          {gap.protocol.description && (
            <p className="text-sm text-graphite/60 mt-2">{gap.protocol.description}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function RetailAttachTab({ data }: { data: any }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-graphite/60">No retail recommendations available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-graphite mb-4">
        Retail Attach Recommendations
      </h2>
      <p className="text-graphite/60 mb-4">
        Recommended products to retail with each service for enhanced results and revenue.
      </p>
      {data.map((attach: any, idx: number) => (
        <div key={idx} className="p-4 bg-background rounded-lg border border-accent-soft">
          <p className="font-medium text-graphite mb-3">{attach.service.name}</p>
          <div className="space-y-2">
            {attach.products.map((product: any, pidx: number) => (
              <div
                key={pidx}
                className="flex items-center justify-between p-3 bg-white rounded border border-accent-soft"
              >
                <div>
                  <p className="font-medium text-graphite">{product.name}</p>
                  <p className="text-sm text-graphite/60">
                    {product.category}
                    {product.size && ` • ${product.size}`}
                  </p>
                </div>
                <Package className="w-5 h-5 text-graphite/60" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ActivationAssetsTab({ data }: { data: any }) {
  if (!data) return <EmptyState />;

  const categories = Object.keys(data).filter((key) => data[key].length > 0);

  if (categories.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-graphite/60">No activation assets available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-graphite mb-2">Activation Kit</h2>
        <p className="text-graphite/60">
          Marketing and training materials to support your brand implementation.
        </p>
      </div>

      {categories.map((category) => (
        <div key={category}>
          <h3 className="text-lg font-bold text-graphite mb-3">{category}</h3>
          <div className="space-y-2">
            {data[category].map((asset: any) => (
              <div
                key={asset.id}
                className="flex items-center justify-between p-3 bg-background rounded-lg border border-accent-soft"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-graphite" />
                  <div>
                    <p className="font-medium text-graphite">{asset.asset_name}</p>
                    <p className="text-sm text-graphite/60">{asset.asset_type}</p>
                  </div>
                </div>
                {asset.asset_url && (
                  <a
                    href={asset.asset_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-graphite hover:text-graphite text-sm font-medium"
                  >
                    Download
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <AlertCircle className="w-12 h-12 text-graphite/60 mx-auto mb-3" />
      <p className="text-graphite/60">No data available for this section</p>
    </div>
  );
}
