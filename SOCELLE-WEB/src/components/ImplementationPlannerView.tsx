import { useState } from 'react';
import { Rocket, CheckCircle, AlertTriangle, Calendar, Package, TrendingUp, FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { generateAllReadinessForMenu } from '../lib/implementationReadinessEngine';
import { generatePhasedRolloutPlan, getRolloutPlanSummary } from '../lib/phasedRolloutPlanner';
import { generateOpeningOrder } from '../lib/openingOrderEngine';
import { generateBrandNarrative, getWhyThisBrandSection } from '../lib/brandDifferentiationEngine';

interface SpaMenu {
  id: string;
  spa_name: string;
  spa_type: string;
}

export default function ImplementationPlannerView() {
  const [selectedMenuId, setSelectedMenuId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'readiness' | 'rollout' | 'opening' | 'brand'>('readiness');
  const [readinessData, setReadinessData] = useState<any[]>([]);
  const [rolloutPlan, setRolloutPlan] = useState<any>(null);
  const [openingOrder, setOpeningOrder] = useState<any>(null);
  const [brandNarrative, setBrandNarrative] = useState<any>(null);

  const { data: menus = [] } = useQuery({
    queryKey: ['implementation-planner-menus'],
    queryFn: async () => {
      const { data } = await supabase
        .from('spa_menus')
        .select('id, spa_name, spa_type')
        .order('created_at', { ascending: false });

      const menusList = (data || []) as SpaMenu[];
      if (menusList.length > 0 && !selectedMenuId) {
        setSelectedMenuId(menusList[0].id);
      }
      return menusList;
    },
  });

  const { isLoading: loading, refetch: refetchData } = useQuery({
    queryKey: ['implementation-planner-data', selectedMenuId, activeTab],
    queryFn: async () => {
      if (activeTab === 'readiness') {
        const { data } = await supabase
          .from('implementation_readiness')
          .select(`
            *,
            service_mapping:spa_service_mapping(service_name),
            gap:service_gap_analysis(gap_description),
            protocol:canonical_protocols(protocol_name)
          `)
          .eq('spa_menu_id', selectedMenuId)
          .order('overall_implementation_risk_score');

        setReadinessData(data || []);
      } else if (activeTab === 'rollout') {
        const { data: plans } = await supabase
          .from('phased_rollout_plans')
          .select('*')
          .eq('spa_menu_id', selectedMenuId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (plans) {
          const summary = await getRolloutPlanSummary(plans.id);
          setRolloutPlan(summary);

          const selectedMenu = menus.find(m => m.id === selectedMenuId);
          if (selectedMenu) {
            const narrative = await generateBrandNarrative(
              selectedMenu.spa_type as 'medspa' | 'spa' | 'hybrid',
              plans.id
            );
            setBrandNarrative(narrative);
          }
        }
      } else if (activeTab === 'opening') {
        const { data: plans } = await supabase
          .from('phased_rollout_plans')
          .select('id')
          .eq('spa_menu_id', selectedMenuId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (plans) {
          const { data: order } = await supabase
            .from('opening_orders')
            .select('*')
            .eq('rollout_plan_id', plans.id)
            .single();

          setOpeningOrder(order);
        }
      } else if (activeTab === 'brand') {
        const selectedMenu = menus.find(m => m.id === selectedMenuId);
        if (selectedMenu) {
          const brandSection = await getWhyThisBrandSection(selectedMenu.spa_type as 'medspa' | 'spa' | 'hybrid');
          setBrandNarrative(brandSection);
        }
      }
      return { activeTab, selectedMenuId };
    },
    enabled: !!selectedMenuId,
  });

  const [generating, setGenerating] = useState(false);

  const generatePlan = async () => {
    if (!selectedMenuId) return;

    setGenerating(true);
    try {
      const selectedMenu = menus.find(m => m.id === selectedMenuId);
      if (!selectedMenu) return;

      await generateAllReadinessForMenu(selectedMenuId);

      const planId = await generatePhasedRolloutPlan(
        selectedMenuId,
        selectedMenu.spa_type as 'medspa' | 'spa' | 'hybrid'
      );

      if (planId) {
        await generateOpeningOrder(planId, selectedMenuId);
      }

      await refetchData();
    } finally {
      setGenerating(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score <= 30) return 'text-green-700 bg-green-50 border-green-200';
    if (score <= 60) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-red-700 bg-red-50 border-red-200';
  };

  const getRiskLabel = (score: number) => {
    if (score <= 30) return 'Low Risk';
    if (score <= 60) return 'Moderate Risk';
    return 'High Risk';
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Rocket className="w-8 h-8 text-graphite" />
            <div>
              <h2 className="text-2xl font-semibold text-graphite">Implementation Planner</h2>
              <p className="text-sm text-graphite/60">Rollout plans, readiness scoring, and onboarding tools</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedMenuId}
              onChange={(e) => setSelectedMenuId(e.target.value)}
              className="px-4 py-2 border border-accent-soft rounded-lg text-sm"
            >
              {menus.map(menu => (
                <option key={menu.id} value={menu.id}>
                  {menu.spa_name} ({menu.spa_type})
                </option>
              ))}
            </select>

            <button
              onClick={generatePlan}
              disabled={loading || generating || !selectedMenuId}
              className="px-4 py-2 bg-graphite text-white rounded-lg hover:bg-graphite disabled:opacity-50 flex items-center gap-2"
            >
              {generating ? 'Generating...' : 'Generate Plan'}
            </button>
          </div>
        </div>

        <div className="bg-accent-soft border border-accent-soft rounded-lg p-4 flex gap-3">
          <FileText className="w-5 h-5 text-graphite flex-shrink-0 mt-0.5" />
          <div className="text-sm text-graphite">
            <strong>Implementation Enablement:</strong> Converts intelligence into executable 30/60/90 day plans.
            All scoring is deterministic and traceable. No estimates without data inputs.
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-accent-soft">
        <div className="border-b border-accent-soft">
          <div className="flex">
            <button
              onClick={() => setActiveTab('readiness')}
              className={`flex-1 px-6 py-3 font-medium transition-colors ${
                activeTab === 'readiness'
                  ? 'border-b-2 border-graphite text-graphite'
                  : 'text-graphite/60 hover:text-graphite'
              }`}
            >
              Implementation Readiness
            </button>
            <button
              onClick={() => setActiveTab('rollout')}
              className={`flex-1 px-6 py-3 font-medium transition-colors ${
                activeTab === 'rollout'
                  ? 'border-b-2 border-graphite text-graphite'
                  : 'text-graphite/60 hover:text-graphite'
              }`}
            >
              Phased Rollout Plan
            </button>
            <button
              onClick={() => setActiveTab('opening')}
              className={`flex-1 px-6 py-3 font-medium transition-colors ${
                activeTab === 'opening'
                  ? 'border-b-2 border-graphite text-graphite'
                  : 'text-graphite/60 hover:text-graphite'
              }`}
            >
              Opening Order
            </button>
            <button
              onClick={() => setActiveTab('brand')}
              className={`flex-1 px-6 py-3 font-medium transition-colors ${
                activeTab === 'brand'
                  ? 'border-b-2 border-graphite text-graphite'
                  : 'text-graphite/60 hover:text-graphite'
              }`}
            >
              Brand Story
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'readiness' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-graphite">Service Readiness Profiles</h3>
                <div className="text-sm text-graphite/60">
                  {readinessData.length} services analyzed
                </div>
              </div>

              {readinessData.length === 0 ? (
                <div className="text-center py-12 text-graphite/60">
                  No readiness data. Click "Generate Plan" to analyze services.
                </div>
              ) : (
                <div className="space-y-3">
                  {readinessData.map((item: any) => (
                    <div key={item.id} className="border border-accent-soft rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-medium text-graphite">
                            {item.service_mapping?.service_name || item.gap?.gap_description}
                          </div>
                          <div className="text-sm text-graphite/60">
                            {item.protocol?.protocol_name}
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full border text-sm font-medium ${getRiskColor(item.overall_implementation_risk_score)}`}>
                          {getRiskLabel(item.overall_implementation_risk_score)} ({item.overall_implementation_risk_score})
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-graphite/60 mb-1">Training</div>
                          <div className="font-medium">{item.training_complexity}</div>
                          {item.estimated_training_hours && (
                            <div className="text-xs text-graphite/60">{item.estimated_training_hours}h</div>
                          )}
                        </div>
                        <div>
                          <div className="text-graphite/60 mb-1">Products</div>
                          <div className="font-medium">{item.product_count_required}</div>
                        </div>
                        <div>
                          <div className="text-graphite/60 mb-1">Contraindications</div>
                          <div className="font-medium">{item.contraindication_sensitivity}</div>
                        </div>
                        <div>
                          <div className="text-graphite/60 mb-1">Staff Level</div>
                          <div className="font-medium">{item.staff_skill_level_required}</div>
                        </div>
                      </div>

                      {item.prerequisites && (
                        <div className="mt-3 pt-3 border-t border-accent-soft">
                          <div className="text-xs text-graphite/60 mb-1">Prerequisites:</div>
                          <div className="text-sm text-graphite">{item.prerequisites}</div>
                        </div>
                      )}

                      {item.missing_data_flags && item.missing_data_flags.length > 0 && (
                        <div className="mt-2 flex items-center gap-2 text-xs text-amber-700">
                          <AlertTriangle className="w-3 h-3" />
                          Missing data: {item.missing_data_flags.join(', ')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'rollout' && rolloutPlan && (
            <div className="space-y-6">
              <div className="bg-background border border-accent-soft rounded-lg p-4">
                <h3 className="font-semibold text-graphite mb-3">{rolloutPlan.plan.plan_name}</h3>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-graphite/60">Total Services</div>
                    <div className="text-lg font-semibold text-graphite">{rolloutPlan.plan.total_services}</div>
                  </div>
                  <div>
                    <div className="text-graphite/60">Avg Risk Score</div>
                    <div className="text-lg font-semibold text-graphite">{Math.round(rolloutPlan.plan.avg_risk_score || 0)}/100</div>
                  </div>
                  <div>
                    <div className="text-graphite/60">Training Hours</div>
                    <div className="text-lg font-semibold text-graphite">{(rolloutPlan.plan.total_training_hours || 0).toFixed(1)}h</div>
                  </div>
                  <div>
                    <div className="text-graphite/60">Phases</div>
                    <div className="text-lg font-semibold text-graphite">{rolloutPlan.plan.total_phases}</div>
                  </div>
                </div>
              </div>

              {brandNarrative && (
                <div className="bg-accent-soft border border-accent-soft rounded-lg p-4">
                  <div className="text-sm text-graphite">{brandNarrative.introduction}</div>
                  {brandNarrative.plan_specific_highlights && brandNarrative.plan_specific_highlights.length > 0 && (
                    <ul className="mt-3 space-y-1 text-sm text-graphite">
                      {brandNarrative.plan_specific_highlights.map((highlight: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          {highlight}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {rolloutPlan.phases.map((phase: any) => (
                <div key={phase.phase_number} className="border border-accent-soft rounded-lg overflow-hidden">
                  <div className="bg-accent-soft px-4 py-3 border-b border-accent-soft">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-graphite">{phase.phase_name}</h4>
                      <div className="flex items-center gap-4 text-sm text-graphite/60">
                        <span>{phase.count} services</span>
                        <span>{phase.total_training_hours.toFixed(1)}h training</span>
                        <span className={`px-2 py-1 rounded ${getRiskColor(phase.avg_risk)}`}>
                          Risk: {Math.round(phase.avg_risk)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="divide-y divide-accent-soft">
                    {phase.items.map((item: any) => (
                      <div key={item.id} className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium text-graphite">{item.service_name}</div>
                            <div className="text-sm text-graphite/60">{item.protocol_name}</div>
                            <div className="text-xs text-graphite/60 mt-1">{item.phase_rationale}</div>
                          </div>
                          <div className="text-right">
                            {item.estimated_revenue && (
                              <div className="text-sm font-medium text-green-700">
                                ${Math.round(item.estimated_revenue).toLocaleString()}/mo
                              </div>
                            )}
                            {item.training_hours && (
                              <div className="text-xs text-graphite/60">{item.training_hours}h training</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'opening' && openingOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="border border-accent-soft rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="w-5 h-5 text-graphite" />
                    <h3 className="font-semibold text-graphite">Backbar Products</h3>
                  </div>
                  <div className="space-y-2">
                    {(openingOrder.backbar_products || []).slice(0, 10).map((product: any, idx: number) => (
                      <div key={idx} className="text-sm">
                        <div className="font-medium text-graphite">{product.product_name}</div>
                        <div className="text-xs text-graphite/60">{product.protocol_name}</div>
                      </div>
                    ))}
                    {openingOrder.backbar_products.length > 10 && (
                      <div className="text-sm text-graphite/60 italic">
                        +{openingOrder.backbar_products.length - 10} more products
                      </div>
                    )}
                  </div>
                </div>

                <div className="border border-accent-soft rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-5 h-5 text-graphite" />
                    <h3 className="font-semibold text-graphite">Retail Assortment</h3>
                  </div>
                  <div className="space-y-2">
                    {(openingOrder.retail_products || []).map((product: any, idx: number) => (
                      <div key={idx} className="text-sm">
                        <div className="font-medium text-graphite">{product.product_name}</div>
                        {product.msrp && (
                          <div className="text-xs text-graphite/60">MSRP: ${product.msrp}</div>
                        )}
                      </div>
                    ))}
                  </div>
                  {openingOrder.estimated_retail_investment && (
                    <div className="mt-4 pt-4 border-t border-accent-soft">
                      <div className="text-sm text-graphite/60">Estimated Investment</div>
                      <div className="text-lg font-semibold text-graphite">
                        ${openingOrder.estimated_retail_investment.toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {openingOrder.recommended_launch_window && (
                <div className="bg-accent-soft border border-accent-soft rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-5 h-5 text-graphite" />
                    <div className="font-semibold text-teal-900">Recommended Launch Window</div>
                  </div>
                  <div className="text-sm text-teal-800">{openingOrder.recommended_launch_window}</div>
                  {openingOrder.seasonal_rationale && (
                    <div className="text-xs text-graphite mt-1">{openingOrder.seasonal_rationale}</div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-3 gap-4">
                {openingOrder.setup_checklist && (
                  <div className="border border-accent-soft rounded-lg p-4">
                    <div className="font-semibold text-graphite mb-3">Setup Checklist</div>
                    <div className="space-y-2 text-sm">
                      {openingOrder.setup_checklist.map((section: any, idx: number) => (
                        <div key={idx}>
                          <div className="font-medium text-graphite">{section.category}</div>
                          <div className="text-xs text-graphite/60">{section.items.length} items</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {openingOrder.training_checklist && (
                  <div className="border border-accent-soft rounded-lg p-4">
                    <div className="font-semibold text-graphite mb-3">Training Checklist</div>
                    <div className="space-y-2 text-sm">
                      {openingOrder.training_checklist.map((section: any, idx: number) => (
                        <div key={idx}>
                          <div className="font-medium text-graphite">{section.category}</div>
                          <div className="text-xs text-graphite/60">{section.items.length} items</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {openingOrder.launch_checklist && (
                  <div className="border border-accent-soft rounded-lg p-4">
                    <div className="font-semibold text-graphite mb-3">Launch Checklist</div>
                    <div className="space-y-2 text-sm">
                      {openingOrder.launch_checklist.map((section: any, idx: number) => (
                        <div key={idx}>
                          <div className="font-medium text-graphite">{section.category}</div>
                          <div className="text-xs text-graphite/60">{section.items.length} items</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'brand' && brandNarrative && (
            <div className="space-y-6">
              <div className="bg-background border border-accent-soft rounded-lg p-6">
                <h3 className="text-xl font-semibold text-graphite mb-4">{brandNarrative.headline}</h3>
                <div className="text-sm text-graphite">
                  These talking points are grounded in actual system features and protocol design.
                  No generic marketing claims.
                </div>
              </div>

              {brandNarrative.sections && brandNarrative.sections.map((section: any, idx: number) => (
                <div key={idx} className="border border-accent-soft rounded-lg p-4">
                  <h4 className="font-semibold text-graphite mb-2">{section.title}</h4>
                  <p className="text-sm text-graphite mb-3">{section.content}</p>
                  <div className="text-xs text-graphite/60">
                    <strong>Grounded in:</strong> {section.grounding.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'rollout' && !rolloutPlan && (
            <div className="text-center py-12 text-graphite/60">
              No rollout plan. Click "Generate Plan" to create a phased implementation plan.
            </div>
          )}

          {activeTab === 'opening' && !openingOrder && (
            <div className="text-center py-12 text-graphite/60">
              No opening order. Generate a rollout plan first.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
