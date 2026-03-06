import { useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { FileText, TrendingUp, DollarSign, Calendar, AlertCircle, Search } from 'lucide-react';

interface BrandPlan {
  id: string;
  business_id: string;
  business_name: string;
  fit_score: number | null;
  created_at: string;
  status: string;
  opening_order_value: number;
}

export default function BrandPlans() {
  const { profile } = useAuth();
  const [plans, setPlans] = useState<BrandPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [minFit, setMinFit] = useState(0);

  useEffect(() => {
    fetchPlans();
  }, [profile]);

  const fetchPlans = async () => {
    if (!profile?.brand_id) {
      setError('No brand associated with your account');
      setLoading(false);
      return;
    }

    try {
      const { data: plansData, error: plansError } = await supabase
        .from('plans')
        .select('id, business_id, fit_score, created_at, status, businesses!inner(name)')
        .eq('brand_id', profile.brand_id)
        .order('created_at', { ascending: false });

      if (plansError) throw plansError;

      const planIds = (plansData || []).map(p => p.id);
      const { data: allOutputs } = planIds.length > 0
        ? await supabase
            .from('business_plan_outputs')
            .select('plan_id, output_data')
            .in('plan_id', planIds)
            .eq('output_type', 'opening_order')
        : { data: [] };

      const outputByPlanId = new Map<string, number>();
      for (const output of allOutputs || []) {
        if (output.output_data && typeof output.output_data === 'object' && 'totalCost' in output.output_data) {
          outputByPlanId.set(output.plan_id, Number(output.output_data.totalCost) || 0);
        }
      }

      const plansWithOrders = (plansData || []).map(plan => ({
        id: plan.id,
        business_id: plan.business_id,
        business_name: (plan.businesses as any)?.name || 'Unknown Business',
        fit_score: plan.fit_score,
        created_at: plan.created_at,
        status: plan.status || 'draft',
        opening_order_value: outputByPlanId.get(plan.id) ?? 0,
      }));

      setPlans(plansWithOrders);
    } catch (err: any) {
      console.error('Error fetching plans:', err);
      setError(err.message || 'Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-pro-stone text-pro-charcoal',
      completed: 'bg-green-100 text-green-700',
      in_progress: 'bg-pro-stone text-pro-charcoal',
    };
    return styles[status] || styles.draft;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pro-navy border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-pro-warm-gray">Loading plans...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Plans</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const totalValue = plans.reduce((sum, plan) => sum + plan.opening_order_value, 0);
  const avgFitScore = plans.length > 0
    ? plans.reduce((sum, plan) => sum + (plan.fit_score || 0), 0) / plans.length
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-pro-charcoal mb-2">Brand Plans</h1>
        <p className="text-pro-warm-gray">
          View all businesses that have analyzed fit with your brand
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border border-pro-stone p-6">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-5 h-5 text-pro-navy" />
            <span className="text-sm text-pro-warm-gray">Total Plans</span>
          </div>
          <div className="text-3xl font-bold text-pro-charcoal">{plans.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-pro-stone p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-pro-warm-gray">Avg Fit Score</span>
          </div>
          <div className="text-3xl font-bold text-pro-charcoal">{Math.round(avgFitScore)}%</div>
        </div>
        <div className="bg-white rounded-lg border border-pro-stone p-6">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            <span className="text-sm text-pro-warm-gray">Total Pipeline</span>
          </div>
          <div className="text-3xl font-bold text-pro-charcoal">${totalValue.toLocaleString()}</div>
        </div>
      </div>

      {/* Search + filter bar */}
      {plans.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 bg-white border border-pro-stone rounded-lg p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pro-warm-gray" />
            <input
              type="text"
              placeholder="Search by business name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-pro-stone rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pro-navy"
            />
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <label className="text-sm text-pro-warm-gray whitespace-nowrap">Min fit score:</label>
            <input
              type="number"
              min={0}
              max={100}
              value={minFit}
              onChange={e => setMinFit(Number(e.target.value))}
              className="w-20 px-3 py-2 border border-pro-stone rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pro-navy"
            />
            <span className="text-sm text-pro-warm-gray">%</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-pro-stone overflow-hidden">
        {plans.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-pro-stone" />
            <p className="text-pro-warm-gray mb-2">No plans yet</p>
            <p className="text-sm text-pro-warm-gray">
              Plans will appear here when businesses analyze their fit with your brand
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {(() => {
              const filtered = plans.filter(p => {
                const matchesSearch = !search ||
                  p.business_name.toLowerCase().includes(search.toLowerCase());
                const matchesFit = !minFit || (p.fit_score ?? 0) >= minFit;
                return matchesSearch && matchesFit;
              });

              if (filtered.length === 0) {
                return (
                  <div className="py-12 text-center">
                    <Search className="w-10 h-10 text-pro-stone mx-auto mb-3" />
                    <p className="text-pro-warm-gray">No plans match your filters</p>
                    <button
                      onClick={() => { setSearch(''); setMinFit(0); }}
                      className="mt-2 text-sm text-pro-navy hover:underline"
                    >
                      Clear filters
                    </button>
                  </div>
                );
              }

              return (
            <table className="w-full">
              <thead className="bg-pro-ivory border-b border-pro-stone">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-pro-warm-gray uppercase tracking-wider">
                    Business ({filtered.length})
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-pro-warm-gray uppercase tracking-wider">
                    Fit Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-pro-warm-gray uppercase tracking-wider">
                    Opening Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-pro-warm-gray uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-pro-warm-gray uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-pro-stone">
                {filtered.map((plan) => (
                  <tr key={plan.id} className="hover:bg-pro-ivory">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-pro-charcoal">{plan.business_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {plan.fit_score !== null ? (
                        <div className="flex items-center gap-2">
                          <div className="text-lg font-bold text-pro-navy">{plan.fit_score}%</div>
                          <div className="w-24 h-2 bg-pro-stone rounded-full overflow-hidden">
                            <div
                              className="h-full bg-pro-navy"
                              style={{ width: `${plan.fit_score}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-pro-warm-gray">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-pro-charcoal font-medium">
                        ${plan.opening_order_value.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-pro-warm-gray">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {new Date(plan.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(plan.status)}`}>
                        {plan.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
