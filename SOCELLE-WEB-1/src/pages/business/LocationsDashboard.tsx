// ── Multi-Location Dashboard ───────────────────────────────────────────
// WO-22: Full comparison view for multi-location operators.
// All data is mock. No Supabase mutations.

import { useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  MapPin,
  TrendingUp,
  TrendingDown,
  Building2,
  DollarSign,
  Package,
  BarChart3,
  Lightbulb,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Zap,
  Star,
} from 'lucide-react';
import { getLocationSummaries, getCrossLocationInsights } from '../../lib/locations/mockLocations';
import type { LocationSummary, CrossLocationInsight } from '../../lib/locations/types';

const BUSINESS_TYPE_LABELS: Record<string, string> = {
  medspa: 'MedSpa',
  day_spa: 'Day Spa',
  salon: 'Salon',
  esthetician_studio: 'Studio',
  clinic: 'Clinic',
};

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-50 text-green-700',
  onboarding: 'bg-amber-50 text-amber-700',
  paused: 'bg-pro-cream text-pro-warm-gray',
};

const IMPACT_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  high: { bg: 'bg-red-50', text: 'text-red-700', label: 'High Impact' },
  medium: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Medium Impact' },
  low: { bg: 'bg-pro-cream', text: 'text-pro-warm-gray', label: 'Low Impact' },
};

function InsightIcon({ type }: { type: CrossLocationInsight['type'] }) {
  switch (type) {
    case 'product_gap':
      return <Package className="w-5 h-5 text-pro-gold" />;
    case 'performance_delta':
      return <AlertTriangle className="w-5 h-5 text-amber-500" />;
    case 'opportunity':
      return <Zap className="w-5 h-5 text-green-600" />;
  }
}

export default function LocationsDashboard() {
  const summaries = useMemo(() => getLocationSummaries(), []);
  const insights = useMemo(() => getCrossLocationInsights(), []);

  // ── Aggregate stats ────────────────────────────────────────────────
  const totalRevenue = summaries.reduce((s, l) => s + l.revenue, 0);
  const avgBenchmark = Math.round(summaries.reduce((s, l) => s + l.benchmarkScore, 0) / summaries.length);
  const totalSkus = summaries.reduce((s, l) => s + l.skuCount, 0);
  const avgGrowth = +(summaries.reduce((s, l) => s + l.growth, 0) / summaries.length).toFixed(1);

  // ── Best / worst ───────────────────────────────────────────────────
  const sorted = [...summaries].sort((a, b) => b.benchmarkScore - a.benchmarkScore);
  const best = sorted[0];
  const worst = sorted[sorted.length - 1];

  // ── Max revenue for bar chart scaling ──────────────────────────────
  const maxRevenue = Math.max(...summaries.map((s) => s.revenue));

  return (
    <>
      <Helmet>
        <title>All Locations | Socelle</title>
      </Helmet>

      <div className="space-y-8">
        {/* ── Header ────────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="w-6 h-6 text-pro-gold" />
            <h1 className="text-2xl font-serif text-pro-navy">All Locations</h1>
          </div>
          <p className="text-pro-warm-gray font-sans">
            Cross-location performance overview and intelligence for your {summaries.length}-location portfolio.
          </p>
        </div>

        {/* ── Aggregate KPI Cards ───────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            label="Total Revenue"
            value={`$${(totalRevenue / 1000).toFixed(1)}K`}
            sub="This month"
            icon={<DollarSign className="w-5 h-5 text-pro-gold" />}
          />
          <KPICard
            label="Locations"
            value={String(summaries.length)}
            sub={`${summaries.filter((s) => s.status === 'active').length} active`}
            icon={<MapPin className="w-5 h-5 text-pro-gold" />}
          />
          <KPICard
            label="Avg Benchmark"
            value={String(avgBenchmark)}
            sub={`of 100 · ${avgGrowth > 0 ? '+' : ''}${avgGrowth}% avg growth`}
            icon={<BarChart3 className="w-5 h-5 text-pro-gold" />}
          />
          <KPICard
            label="Total SKUs"
            value={String(totalSkus)}
            sub="Across all locations"
            icon={<Package className="w-5 h-5 text-pro-gold" />}
          />
        </div>

        {/* ── Best / Worst Highlights ──────────────────────────────── */}
        <div className="grid md:grid-cols-2 gap-4">
          <HighlightCard
            type="best"
            summary={best}
          />
          <HighlightCard
            type="worst"
            summary={worst}
          />
        </div>

        {/* ── Location Comparison Table ────────────────────────────── */}
        <div className="bg-white rounded-xl border border-pro-stone overflow-hidden">
          <div className="px-6 py-4 border-b border-pro-stone">
            <h2 className="font-serif text-lg text-pro-navy">Location Comparison</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="bg-pro-ivory text-left text-pro-warm-gray text-xs uppercase tracking-wider">
                  <th className="px-6 py-3 font-semibold">Location</th>
                  <th className="px-4 py-3 font-semibold">City</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold text-right">Revenue</th>
                  <th className="px-4 py-3 font-semibold text-right">Growth</th>
                  <th className="px-4 py-3 font-semibold text-right">SKUs</th>
                  <th className="px-4 py-3 font-semibold text-right">Score</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-pro-stone/50">
                {summaries.map((s) => (
                  <tr key={s.location.id} className="hover:bg-pro-ivory/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-pro-gold flex-shrink-0" />
                        <span className="font-medium text-pro-charcoal">{s.location.locationName}</span>
                        {s.location.isPrimary && (
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-pro-gold bg-pro-gold/10 px-1.5 py-0.5 rounded">
                            Primary
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-pro-warm-gray">
                      {s.location.city}, {s.location.state}
                    </td>
                    <td className="px-4 py-4 text-pro-warm-gray">
                      {BUSINESS_TYPE_LABELS[s.location.businessType] ?? s.location.businessType}
                    </td>
                    <td className="px-4 py-4 text-right font-medium text-pro-charcoal">
                      ${s.revenue.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className={`inline-flex items-center gap-1 font-medium ${s.growth >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {s.growth >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        {s.growth >= 0 ? '+' : ''}{s.growth}%
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right text-pro-charcoal">{s.skuCount}</td>
                    <td className="px-4 py-4 text-right font-medium text-pro-charcoal">{s.benchmarkScore}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-block text-xs font-semibold px-2 py-1 rounded-full capitalize ${STATUS_STYLES[s.status] ?? ''}`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Benchmark Score Comparison (CSS bar chart) ───────────── */}
        <div className="bg-white rounded-xl border border-pro-stone p-6">
          <h2 className="font-serif text-lg text-pro-navy mb-6">Benchmark Score by Location</h2>
          <div className="space-y-4">
            {sorted.map((s) => (
              <div key={s.location.id} className="flex items-center gap-4">
                <div className="w-48 text-sm font-sans text-pro-charcoal truncate">
                  {s.location.locationName}
                </div>
                <div className="flex-1 h-7 bg-pro-ivory rounded-full overflow-hidden relative">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${s.benchmarkScore}%`,
                      background: s.benchmarkScore >= 70
                        ? 'linear-gradient(90deg, #D4A44C 0%, #c9963f 100%)'
                        : s.benchmarkScore >= 60
                          ? 'linear-gradient(90deg, #D6D1C9 0%, #bfb9b0 100%)'
                          : 'linear-gradient(90deg, #e8c4a0 0%, #d4a87a 100%)',
                    }}
                  />
                  <span className="absolute inset-y-0 right-3 flex items-center text-xs font-semibold text-pro-charcoal">
                    {s.benchmarkScore}/100
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-pro-warm-gray mt-4 font-sans">
            Peer benchmark average for your region: 66/100
          </p>
        </div>

        {/* ── Revenue by Location (CSS bar chart) ──────────────────── */}
        <div className="bg-white rounded-xl border border-pro-stone p-6">
          <h2 className="font-serif text-lg text-pro-navy mb-6">Monthly Revenue by Location</h2>
          <div className="space-y-4">
            {[...summaries].sort((a, b) => b.revenue - a.revenue).map((s) => (
              <div key={s.location.id} className="flex items-center gap-4">
                <div className="w-48 text-sm font-sans text-pro-charcoal truncate">
                  {s.location.locationName}
                </div>
                <div className="flex-1 h-7 bg-pro-ivory rounded-full overflow-hidden relative">
                  <div
                    className="h-full bg-pro-navy/80 rounded-full transition-all duration-700"
                    style={{ width: `${(s.revenue / maxRevenue) * 100}%` }}
                  />
                  <span className="absolute inset-y-0 right-3 flex items-center text-xs font-semibold text-pro-charcoal">
                    ${(s.revenue / 1000).toFixed(1)}K
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Cross-Location Insights ──────────────────────────────── */}
        <div className="bg-white rounded-xl border border-pro-stone overflow-hidden">
          <div className="px-6 py-4 border-b border-pro-stone flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-pro-gold" />
            <h2 className="font-serif text-lg text-pro-navy">Cross-Location Intelligence</h2>
          </div>
          <div className="divide-y divide-pro-stone/50">
            {insights.map((insight, i) => {
              const impact = IMPACT_STYLES[insight.impact];
              return (
                <div key={i} className="px-6 py-5 flex items-start gap-4">
                  <div className="mt-0.5">
                    <InsightIcon type={insight.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-pro-charcoal font-sans">{insight.title}</h3>
                      <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded ${impact.bg} ${impact.text}`}>
                        {impact.label}
                      </span>
                    </div>
                    <p className="text-sm text-pro-warm-gray font-sans leading-relaxed">{insight.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────

function KPICard({ label, value, sub, icon }: { label: string; value: string; sub: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-pro-stone p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-pro-warm-gray font-sans">{label}</span>
        {icon}
      </div>
      <div className="text-2xl font-serif text-pro-charcoal">{value}</div>
      <div className="text-xs text-pro-warm-gray font-sans mt-1">{sub}</div>
    </div>
  );
}

function HighlightCard({ type, summary }: { type: 'best' | 'worst'; summary: LocationSummary }) {
  const isBest = type === 'best';
  return (
    <div className={`rounded-xl border p-5 ${isBest ? 'border-green-200 bg-green-50/50' : 'border-amber-200 bg-amber-50/50'}`}>
      <div className="flex items-center gap-2 mb-3">
        {isBest ? (
          <Star className="w-5 h-5 text-green-600" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-amber-600" />
        )}
        <span className={`text-xs font-semibold uppercase tracking-wider ${isBest ? 'text-green-700' : 'text-amber-700'}`}>
          {isBest ? 'Top Performer' : 'Needs Attention'}
        </span>
      </div>
      <h3 className="font-serif text-lg text-pro-charcoal mb-1">{summary.location.locationName}</h3>
      <p className="text-sm text-pro-warm-gray font-sans">
        {summary.location.city}, {summary.location.state} &middot;{' '}
        {BUSINESS_TYPE_LABELS[summary.location.businessType] ?? summary.location.businessType}
      </p>
      <div className="flex items-center gap-4 mt-3 text-sm font-sans">
        <span className="text-pro-charcoal font-medium">Score: {summary.benchmarkScore}/100</span>
        <span className={`flex items-center gap-1 font-medium ${summary.growth >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          {summary.growth >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          {summary.growth >= 0 ? '+' : ''}{summary.growth}%
        </span>
        <span className="text-pro-warm-gray">${summary.revenue.toLocaleString()}/mo</span>
      </div>
    </div>
  );
}
