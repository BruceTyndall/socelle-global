import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, GitCompare, TrendingUp, DollarSign, ChevronDown } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth';
import BusinessNav from '../../components/BusinessNav';
import { Skeleton } from '../../components/Skeleton';

interface PlanSummary {
  id: string;
  name: string;
  status: string;
  created_at: string;
  brands: { name: string } | null;
}

interface PlanOutput {
  fit_score: number | null;
  opening_order_total: number | null;
  gap_count: number | null;
  protocol_match_count: number | null;
  retail_attach_count: number | null;
  phase_count: number | null;
  raw: Record<string, any>;
}

async function fetchPlanOutput(planId: string): Promise<PlanOutput> {
  const { data: plan } = await supabase
    .from('plans')
    .select('fit_score')
    .eq('id', planId)
    .single();

  const { data: outputs } = await supabase
    .from('business_plan_outputs')
    .select('output_type, output_data')
    .eq('plan_id', planId);

  const byType: Record<string, any> = {};
  for (const o of outputs || []) {
    byType[o.output_type] = o.output_data;
  }

  const openingOrder = byType['opening_order'] || {};
  const gapAnalysis = byType['gap_analysis'] || {};
  const serviceMapping = byType['service_mapping'] || {};
  const retailAttach = byType['retail_attach'] || {};
  const rollout = byType['rollout_plan'] || {};

  return {
    fit_score: plan?.fit_score ?? null,
    opening_order_total: openingOrder.totalCost != null ? Number(openingOrder.totalCost) : null,
    gap_count:
      Array.isArray(gapAnalysis.gaps)
        ? gapAnalysis.gaps.length
        : gapAnalysis.totalGaps != null
        ? Number(gapAnalysis.totalGaps)
        : null,
    protocol_match_count:
      Array.isArray(serviceMapping.mappings)
        ? serviceMapping.mappings.filter((m: any) => m.matched).length
        : serviceMapping.matchedCount != null
        ? Number(serviceMapping.matchedCount)
        : null,
    retail_attach_count:
      Array.isArray(retailAttach.recommendations)
        ? retailAttach.recommendations.length
        : retailAttach.count != null
        ? Number(retailAttach.count)
        : null,
    phase_count:
      Array.isArray(rollout.phases)
        ? rollout.phases.length
        : rollout.phaseCount != null
        ? Number(rollout.phaseCount)
        : null,
    raw: byType,
  };
}

function MetricRow({
  label,
  a,
  b,
  format = 'number',
  higherIsBetter = true,
}: {
  label: string;
  a: number | null;
  b: number | null;
  format?: 'number' | 'currency' | 'percent';
  higherIsBetter?: boolean;
}) {
  const fmt = (v: number | null) => {
    if (v == null) return '—';
    if (format === 'currency') return `$${v.toLocaleString()}`;
    if (format === 'percent') return `${Math.round(v)}%`;
    return v.toLocaleString();
  };

  const aWins =
    a != null &&
    b != null &&
    (higherIsBetter ? a > b : a < b);
  const bWins =
    a != null &&
    b != null &&
    (higherIsBetter ? b > a : b < a);

  return (
    <div className="grid grid-cols-3 items-center gap-4 py-3 border-b border-pro-stone last:border-0">
      <div className="text-sm text-pro-warm-gray font-medium text-center">{label}</div>
      <div
        className={`text-center text-lg font-bold rounded-lg py-1 ${
          aWins
            ? 'text-green-700 bg-green-50'
            : bWins
            ? 'text-pro-warm-gray bg-pro-ivory'
            : 'text-pro-charcoal'
        }`}
      >
        {fmt(a)}
      </div>
      <div
        className={`text-center text-lg font-bold rounded-lg py-1 ${
          bWins
            ? 'text-green-700 bg-green-50'
            : aWins
            ? 'text-pro-warm-gray bg-pro-ivory'
            : 'text-pro-charcoal'
        }`}
      >
        {fmt(b)}
      </div>
    </div>
  );
}

export default function PlanComparison() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [allPlans, setAllPlans] = useState<PlanSummary[]>([]);
  const [planAId, setPlanAId] = useState<string>(searchParams.get('a') || '');
  const [planBId, setPlanBId] = useState<string>(searchParams.get('b') || '');
  const [outputA, setOutputA] = useState<PlanOutput | null>(null);
  const [outputB, setOutputB] = useState<PlanOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [comparing, setComparing] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('plans')
      .select('id, name, status, created_at, brands(name)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setAllPlans((data as unknown as PlanSummary[]) || []);
        setLoading(false);
      });
  }, [user]);

  useEffect(() => {
    if (!planAId || !planBId) {
      setOutputA(null);
      setOutputB(null);
      return;
    }
    setComparing(true);
    setSearchParams({ a: planAId, b: planBId });
    Promise.all([fetchPlanOutput(planAId), fetchPlanOutput(planBId)]).then(([a, b]) => {
      setOutputA(a);
      setOutputB(b);
      setComparing(false);
    });
  }, [planAId, planBId]);

  const planA = allPlans.find(p => p.id === planAId);
  const planB = allPlans.find(p => p.id === planBId);

  return (
    <>
      <BusinessNav />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Link
              to="/portal/plans"
              className="inline-flex items-center gap-2 text-sm text-pro-warm-gray hover:text-pro-charcoal mb-3"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Plans
            </Link>
            <h1 className="text-2xl font-bold text-pro-charcoal flex items-center gap-2">
              <GitCompare className="w-6 h-6 text-pro-navy" />
              Compare Plans
            </h1>
            <p className="text-pro-warm-gray mt-1 text-sm">
              Select two plans to compare their results side by side
            </p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : allPlans.length < 2 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-pro-stone">
            <GitCompare className="w-12 h-12 text-pro-stone mx-auto mb-3" />
            <p className="text-pro-warm-gray font-medium">You need at least 2 plans to compare</p>
            <Link
              to="/portal/plans/new"
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-pro-navy text-white rounded-lg text-sm font-medium hover:bg-pro-charcoal transition-colors"
            >
              Create a Plan
            </Link>
          </div>
        ) : (
          <>
            {/* Plan selectors */}
            <div className="grid grid-cols-3 gap-4">
              <PlanSelector
                label="Plan A"
                plans={allPlans}
                value={planAId}
                excludeId={planBId}
                onChange={setPlanAId}
                color="blue"
              />
              <div className="flex items-center justify-center">
                <span className="text-2xl font-bold text-pro-stone">vs</span>
              </div>
              <PlanSelector
                label="Plan B"
                plans={allPlans}
                value={planBId}
                excludeId={planAId}
                onChange={setPlanBId}
                color="purple"
              />
            </div>

            {/* Comparison table */}
            {planAId && planBId && (
              <div className="bg-white rounded-lg border border-pro-stone overflow-hidden">
                {/* Header */}
                <div className="grid grid-cols-3 gap-4 bg-pro-ivory border-b border-pro-stone px-6 py-4">
                  <div className="text-sm font-medium text-pro-warm-gray text-center">Metric</div>
                  <div className="text-center">
                    <p className="font-semibold text-pro-charcoal truncate">{planA?.name || 'Plan A'}</p>
                    <p className="text-xs text-pro-warm-gray">{planA?.brands?.name}</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-purple-700 truncate">{planB?.name || 'Plan B'}</p>
                    <p className="text-xs text-pro-warm-gray">{planB?.brands?.name}</p>
                  </div>
                </div>

                {comparing ? (
                  <div className="px-6 py-8 space-y-4">
                    {[0, 1, 2, 3, 4, 5].map(i => (
                      <div key={i} className="grid grid-cols-3 gap-4">
                        <Skeleton className="h-8" />
                        <Skeleton className="h-8" />
                        <Skeleton className="h-8" />
                      </div>
                    ))}
                  </div>
                ) : outputA && outputB ? (
                  <div className="px-6 py-2">
                    <MetricRow
                      label="Fit Score"
                      a={outputA.fit_score}
                      b={outputB.fit_score}
                      format="percent"
                    />
                    <MetricRow
                      label="Opening Order Value"
                      a={outputA.opening_order_total}
                      b={outputB.opening_order_total}
                      format="currency"
                    />
                    <MetricRow
                      label="Protocol Matches"
                      a={outputA.protocol_match_count}
                      b={outputB.protocol_match_count}
                    />
                    <MetricRow
                      label="Service Gaps Identified"
                      a={outputA.gap_count}
                      b={outputB.gap_count}
                      higherIsBetter={false}
                    />
                    <MetricRow
                      label="Retail Recommendations"
                      a={outputA.retail_attach_count}
                      b={outputB.retail_attach_count}
                    />
                    <MetricRow
                      label="Rollout Phases"
                      a={outputA.phase_count}
                      b={outputB.phase_count}
                    />
                  </div>
                ) : null}

                {/* Footer links */}
                {!comparing && outputA && outputB && (
                  <div className="grid grid-cols-3 gap-4 border-t border-pro-stone px-6 py-4 bg-pro-ivory">
                    <div />
                    <div className="text-center">
                      <Link
                        to={`/portal/plans/${planAId}`}
                        className="text-sm text-pro-navy hover:text-pro-charcoal font-medium hover:underline flex items-center justify-center gap-1"
                      >
                        <TrendingUp className="w-3.5 h-3.5" />
                        View Full Plan
                      </Link>
                    </div>
                    <div className="text-center">
                      <Link
                        to={`/portal/plans/${planBId}`}
                        className="text-sm text-purple-600 hover:text-pro-navy font-medium hover:underline flex items-center justify-center gap-1"
                      >
                        <TrendingUp className="w-3.5 h-3.5" />
                        View Full Plan
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!planAId || !planBId ? (
              <div className="text-center py-10 bg-white rounded-lg border border-dashed border-pro-stone">
                <DollarSign className="w-10 h-10 text-pro-stone mx-auto mb-2" />
                <p className="text-pro-warm-gray text-sm">Select two plans above to see the comparison</p>
              </div>
            ) : null}
          </>
        )}
      </div>
    </>
  );
}

function PlanSelector({
  label,
  plans,
  value,
  excludeId,
  onChange,
  color,
}: {
  label: string;
  plans: PlanSummary[];
  value: string;
  excludeId: string;
  onChange: (id: string) => void;
  color: 'blue' | 'purple';
}) {
  const colorClass = color === 'blue' ? 'border-pro-stone focus:ring-pro-navy' : 'border-purple-300 focus:ring-pro-navy';
  const labelColor = color === 'blue' ? 'text-pro-charcoal' : 'text-purple-700';

  return (
    <div>
      <label className={`block text-xs font-semibold uppercase tracking-wide mb-2 ${labelColor}`}>
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className={`w-full appearance-none pl-3 pr-8 py-2.5 border ${colorClass} rounded-lg text-sm focus:outline-none focus:ring-2 bg-white`}
        >
          <option value="">Select a plan...</option>
          {plans
            .filter(p => p.id !== excludeId)
            .map(p => (
              <option key={p.id} value={p.id}>
                {p.name} — {p.brands?.name || 'No brand'} ({new Date(p.created_at).toLocaleDateString()})
              </option>
            ))}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-pro-warm-gray pointer-events-none" />
      </div>
    </div>
  );
}
