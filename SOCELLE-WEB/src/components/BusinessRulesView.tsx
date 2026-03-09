import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Save, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Benchmark {
  id: string;
  spa_type: string;
  category: string;
  min_service_count: number;
  priority_level: string;
  notes: string;
  is_active: boolean;
}

interface RevenueDefaults {
  id: string;
  spa_type: string;
  default_utilization_per_month: number | null;
  default_attach_rate: number | null;
  default_retail_conversion_rate: number | null;
  notes: string;
  is_active: boolean;
}

export default function BusinessRulesView() {
  const [activeTab, setActiveTab] = useState<'benchmarks' | 'revenue'>('benchmarks');
  const queryClient = useQueryClient();

  const { data: benchmarks = [] } = useQuery<Benchmark[]>({
    queryKey: ['service_category_benchmarks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_category_benchmarks')
        .select('*')
        .order('spa_type, category');
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: revenueDefaults = [] } = useQuery<RevenueDefaults[]>({
    queryKey: ['revenue_model_defaults'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('revenue_model_defaults')
        .select('*')
        .order('spa_type');
      if (error) throw error;
      return data ?? [];
    },
  });

  const benchmarkMutation = useMutation({
    mutationFn: async (benchmark: Benchmark) => {
      const { error } = await supabase
        .from('service_category_benchmarks')
        .update({
          min_service_count: benchmark.min_service_count,
          priority_level: benchmark.priority_level,
          notes: benchmark.notes,
          is_active: benchmark.is_active,
          updated_by: 'admin',
        })
        .eq('id', benchmark.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['service_category_benchmarks'] }),
  });

  const revenueDefaultsMutation = useMutation({
    mutationFn: async (defaults: RevenueDefaults) => {
      const { error } = await supabase
        .from('revenue_model_defaults')
        .update({
          default_utilization_per_month: defaults.default_utilization_per_month,
          default_attach_rate: defaults.default_attach_rate,
          default_retail_conversion_rate: defaults.default_retail_conversion_rate,
          notes: defaults.notes,
          is_active: defaults.is_active,
          updated_by: 'admin',
        })
        .eq('id', defaults.id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['revenue_model_defaults'] }),
  });

  const saving = benchmarkMutation.isPending || revenueDefaultsMutation.isPending;

  const updateBenchmark = (benchmark: Benchmark) => {
    benchmarkMutation.mutate(benchmark);
  };

  const updateRevenueDefaults = (defaults: RevenueDefaults) => {
    revenueDefaultsMutation.mutate(defaults);
  };

  const groupedBenchmarks = benchmarks.reduce((acc, b) => {
    if (!acc[b.spa_type]) acc[b.spa_type] = [];
    acc[b.spa_type].push(b);
    return acc;
  }, {} as { [key: string]: Benchmark[] });

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="w-8 h-8 text-graphite" />
          <div>
            <h2 className="text-2xl font-semibold text-graphite">Business Rules</h2>
            <p className="text-sm text-graphite/60">Configure benchmarks and revenue model assumptions</p>
          </div>
        </div>

        <div className="bg-accent-soft border border-accent-soft rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-graphite flex-shrink-0 mt-0.5" />
          <div className="text-sm text-graphite">
            <strong>Governance Model:</strong> All intelligence engine recommendations are based on these configurable rules.
            Changes here immediately affect gap analysis and revenue estimations. No hardcoded assumptions.
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-accent-soft">
        <div className="border-b border-accent-soft">
          <div className="flex">
            <button
              onClick={() => setActiveTab('benchmarks')}
              className={`flex-1 px-6 py-3 font-medium transition-colors ${
                activeTab === 'benchmarks'
                  ? 'border-b-2 border-graphite text-graphite'
                  : 'text-graphite/60 hover:text-graphite'
              }`}
            >
              Service Category Benchmarks
            </button>
            <button
              onClick={() => setActiveTab('revenue')}
              className={`flex-1 px-6 py-3 font-medium transition-colors ${
                activeTab === 'revenue'
                  ? 'border-b-2 border-graphite text-graphite'
                  : 'text-graphite/60 hover:text-graphite'
              }`}
            >
              Revenue Model Defaults
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'benchmarks' ? (
            <div className="space-y-6">
              {Object.entries(groupedBenchmarks).map(([spaType, benchmarkList]) => (
                <div key={spaType} className="border border-accent-soft rounded-lg overflow-hidden">
                  <div className="bg-background px-4 py-3 border-b border-accent-soft">
                    <h3 className="font-semibold text-graphite capitalize">
                      {spaType.replace('medspa', 'Med Spa')}
                    </h3>
                  </div>
                  <div className="divide-y divide-accent-soft">
                    {benchmarkList.map((benchmark) => (
                      <div key={benchmark.id} className="p-4">
                        <div className="grid grid-cols-12 gap-4 items-start">
                          <div className="col-span-2">
                            <div className="font-medium text-graphite">{benchmark.category}</div>
                          </div>
                          <div className="col-span-1">
                            <input
                              type="number"
                              value={benchmark.min_service_count}
                              onChange={(e) => {
                                const updated = { ...benchmark, min_service_count: parseInt(e.target.value) };
                                queryClient.setQueryData<Benchmark[]>(['service_category_benchmarks'], (prev) =>
                                  prev ? prev.map(b => b.id === benchmark.id ? updated : b) : prev
                                );
                              }}
                              onBlur={() => updateBenchmark(benchmark)}
                              className="w-full px-2 py-1 border border-accent-soft rounded text-sm"
                            />
                            <div className="text-xs text-graphite/60 mt-1">Min Count</div>
                          </div>
                          <div className="col-span-2">
                            <select
                              value={benchmark.priority_level}
                              onChange={(e) => {
                                const updated = { ...benchmark, priority_level: e.target.value };
                                queryClient.setQueryData<Benchmark[]>(['service_category_benchmarks'], (prev) =>
                                  prev ? prev.map(b => b.id === benchmark.id ? updated : b) : prev
                                );
                                updateBenchmark(updated);
                              }}
                              className="w-full px-2 py-1 border border-accent-soft rounded text-sm"
                            >
                              <option value="High">High</option>
                              <option value="Medium">Medium</option>
                              <option value="Low">Low</option>
                            </select>
                            <div className="text-xs text-graphite/60 mt-1">Priority</div>
                          </div>
                          <div className="col-span-5">
                            <input
                              type="text"
                              value={benchmark.notes}
                              onChange={(e) => {
                                const updated = { ...benchmark, notes: e.target.value };
                                queryClient.setQueryData<Benchmark[]>(['service_category_benchmarks'], (prev) =>
                                  prev ? prev.map(b => b.id === benchmark.id ? updated : b) : prev
                                );
                              }}
                              onBlur={() => updateBenchmark(benchmark)}
                              className="w-full px-2 py-1 border border-accent-soft rounded text-sm"
                              placeholder="Rationale..."
                            />
                            <div className="text-xs text-graphite/60 mt-1">Notes</div>
                          </div>
                          <div className="col-span-2 flex items-center justify-end">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={benchmark.is_active}
                                onChange={(e) => {
                                  const updated = { ...benchmark, is_active: e.target.checked };
                                  queryClient.setQueryData<Benchmark[]>(['service_category_benchmarks'], (prev) =>
                                    prev ? prev.map(b => b.id === benchmark.id ? updated : b) : prev
                                  );
                                  updateBenchmark(updated);
                                }}
                                className="rounded"
                              />
                              <span className="text-sm text-graphite">Active</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {revenueDefaults.map((defaults) => (
                <div key={defaults.id} className="border border-accent-soft rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-graphite capitalize">
                      {defaults.spa_type.replace('medspa', 'Med Spa')}
                    </h3>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={defaults.is_active}
                        onChange={(e) => {
                          const updated = { ...defaults, is_active: e.target.checked };
                          queryClient.setQueryData<RevenueDefaults[]>(['revenue_model_defaults'], (prev) =>
                            prev ? prev.map(r => r.id === defaults.id ? updated : r) : prev
                          );
                          updateRevenueDefaults(updated);
                        }}
                        className="rounded"
                      />
                      <span className="text-sm text-graphite">Active</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-graphite mb-1">
                        Utilization/Month
                      </label>
                      <input
                        type="number"
                        value={defaults.default_utilization_per_month || ''}
                        onChange={(e) => {
                          const updated = { ...defaults, default_utilization_per_month: e.target.value ? parseInt(e.target.value) : null };
                          queryClient.setQueryData<RevenueDefaults[]>(['revenue_model_defaults'], (prev) =>
                            prev ? prev.map(r => r.id === defaults.id ? updated : r) : prev
                          );
                        }}
                        onBlur={() => updateRevenueDefaults(defaults)}
                        className="w-full px-3 py-2 border border-accent-soft rounded"
                        placeholder="e.g., 40"
                      />
                      <p className="text-xs text-graphite/60 mt-1">Expected bookings per month</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-graphite mb-1">
                        Attach Rate (%)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={defaults.default_attach_rate || ''}
                        onChange={(e) => {
                          const updated = { ...defaults, default_attach_rate: e.target.value ? parseFloat(e.target.value) : null };
                          queryClient.setQueryData<RevenueDefaults[]>(['revenue_model_defaults'], (prev) =>
                            prev ? prev.map(r => r.id === defaults.id ? updated : r) : prev
                          );
                        }}
                        onBlur={() => updateRevenueDefaults(defaults)}
                        className="w-full px-3 py-2 border border-accent-soft rounded"
                        placeholder="e.g., 35.00"
                      />
                      <p className="text-xs text-graphite/60 mt-1">% with enhancement add-ons</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-graphite mb-1">
                        Retail Conversion (%)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={defaults.default_retail_conversion_rate || ''}
                        onChange={(e) => {
                          const updated = { ...defaults, default_retail_conversion_rate: e.target.value ? parseFloat(e.target.value) : null };
                          queryClient.setQueryData<RevenueDefaults[]>(['revenue_model_defaults'], (prev) =>
                            prev ? prev.map(r => r.id === defaults.id ? updated : r) : prev
                          );
                        }}
                        onBlur={() => updateRevenueDefaults(defaults)}
                        className="w-full px-3 py-2 border border-accent-soft rounded"
                        placeholder="e.g., 25.00"
                      />
                      <p className="text-xs text-graphite/60 mt-1">% who purchase retail</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-graphite mb-1">
                      Assumptions & Notes
                    </label>
                    <textarea
                      value={defaults.notes || ''}
                      onChange={(e) => {
                        const updated = { ...defaults, notes: e.target.value };
                        queryClient.setQueryData<RevenueDefaults[]>(['revenue_model_defaults'], (prev) =>
                          prev ? prev.map(r => r.id === defaults.id ? updated : r) : prev
                        );
                      }}
                      onBlur={() => updateRevenueDefaults(defaults)}
                      className="w-full px-3 py-2 border border-accent-soft rounded text-sm"
                      rows={2}
                      placeholder="Document assumptions and data sources..."
                    />
                  </div>
                </div>
              ))}

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-900">
                  <strong>Revenue Estimation Governance:</strong> These defaults are only used when spa-specific data is unavailable.
                  When service prices and utilization are known, those values take precedence. NULL values result in "Unknown" impact estimates.
                </div>
              </div>
            </div>
          )}

          {saving && (
            <div className="fixed bottom-4 right-4 bg-graphite text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
              <Save className="w-4 h-4 animate-pulse" />
              Saving...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
