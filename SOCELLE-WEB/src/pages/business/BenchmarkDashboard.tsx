import { Helmet } from 'react-helmet-async';
import {
  DollarSign,
  Package,
  Layers,
  RefreshCw,
  Building2,
  ShoppingCart,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Users,
  Target,
} from 'lucide-react';
import { useBenchmarkData } from '../../lib/intelligence/useBenchmarkData';
import { useAuth } from '../../lib/auth';
import type { BenchmarkDimension, BenchmarkScore } from '../../lib/intelligence/benchmarkTypes';

// ── Helpers ─────────────────────────────────────────────────────────

const dimensionIcons: Record<BenchmarkDimension, React.ElementType> = {
  revenue: DollarSign,
  sku_diversity: Package,
  category_coverage: Layers,
  reorder_health: RefreshCw,
  brand_diversity: Building2,
  avg_order_value: ShoppingCart,
};

function scoreColor(score: number): string {
  if (score >= 70) return 'bg-signal-up';
  if (score >= 40) return 'bg-amber-400';
  return 'bg-signal-down';
}

function scoreTextColor(score: number): string {
  if (score >= 70) return 'text-signal-up';
  if (score >= 40) return 'text-amber-500';
  return 'text-signal-down';
}

function statusBadge(status: 'healthy' | 'warning' | 'critical') {
  const map = {
    healthy:  { bg: 'bg-green-50 text-green-700 border-green-200', label: 'Healthy' },
    warning:  { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Warning' },
    critical: { bg: 'bg-red-50 text-red-700 border-red-200',       label: 'Critical' },
  };
  const s = map[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${s.bg}`}>
      {s.label}
    </span>
  );
}

function formatValue(val: number, unit: string): string {
  if (unit === '$') return `$${val.toLocaleString()}`;
  if (unit === '%') return `${val}%`;
  return `${val} ${unit}`;
}

// ── Circular Score Ring (CSS only) ──────────────────────────────────

function ScoreRing({ score, size = 180 }: { score: number; size?: number }) {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={score >= 70 ? '#22C55E' : score >= 40 ? '#F59E0B' : '#EF4444'}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-sans font-bold text-white">{score}</span>
        <span className="text-sm text-white/60 font-sans mt-1">out of 100</span>
      </div>
    </div>
  );
}

// ── Dimension Card ──────────────────────────────────────────────────

function DimensionCard({ dim }: { dim: BenchmarkScore }) {
  const Icon = dimensionIcons[dim.dimension];
  return (
    <div className="bg-white rounded-xl border border-accent-soft p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent-soft flex items-center justify-center">
            <Icon className="w-5 h-5 text-graphite" />
          </div>
          <div>
            <h3 className="font-sans font-semibold text-graphite text-sm">{dim.label}</h3>
            <span className={`text-xs font-medium ${scoreTextColor(dim.score)}`}>
              {dim.percentile}th percentile
            </span>
          </div>
        </div>
        <span className={`text-2xl font-sans font-bold ${scoreTextColor(dim.score)}`}>
          {dim.score}
        </span>
      </div>

      {/* Score bar */}
      <div className="w-full h-2.5 bg-accent-soft rounded-full overflow-hidden mb-3">
        <div
          className={`h-full rounded-full transition-all duration-700 ${scoreColor(dim.score)}`}
          style={{ width: `${dim.score}%` }}
        />
      </div>

      {/* Comparison */}
      <div className="flex items-center justify-between text-xs font-sans text-graphite/60 mb-3">
        <span>You: <span className="font-semibold text-graphite">{formatValue(dim.operatorValue, dim.unit)}</span></span>
        <span>Peers: <span className="font-semibold text-graphite">{formatValue(dim.peerMedian, dim.unit)}</span></span>
      </div>

      {/* Recommendation */}
      {dim.recommendation && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2">
          <div className="flex gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 font-sans leading-relaxed">{dim.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────

import { Skeleton } from '../../components/ui/Skeleton';

export default function BenchmarkDashboard() {
  const { profile } = useAuth();
  const { benchmark, categories, reorderItems, peerGroup, loading: benchmarkLoading, isLive } = useBenchmarkData(profile?.business_id ?? undefined);

  if (benchmarkLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 w-1/3 bg-accent-soft/40 rounded"></div>
        <div className="h-48 w-full bg-accent-soft/40 rounded-2xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <div className="h-40 bg-accent-soft/40 rounded-xl"></div>
          <div className="h-40 bg-accent-soft/40 rounded-xl"></div>
          <div className="h-40 bg-accent-soft/40 rounded-xl"></div>
        </div>
      </div>
    );
  }

  const belowPeerDimensions = benchmark.dimensions.filter((d) => d.recommendation);

  return (
    <>
      <Helmet>
        <title>Your Benchmarks | Socelle</title>
      </Helmet>

      <div className="space-y-8">
        {/* ── Header ──────────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-sans text-3xl text-graphite">Your Treatment Room Benchmarks</h1>
            {!isLive && (
              <span className="text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-pill">DEMO</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Users className="w-4 h-4 text-graphite/60" />
            <p className="text-sm text-graphite/60 font-sans">
              Compared to <span className="font-semibold text-graphite">{peerGroup.size} {peerGroup.type.toLowerCase()}</span> in the{' '}
              <span className="font-semibold text-graphite">{peerGroup.region}</span> region
              &middot; Avg revenue {peerGroup.avgRevenue}
            </p>
          </div>
        </div>

        {/* ── Composite Score Panel ───────────────────────────── */}
        <div className="bg-graphite rounded-2xl p-8 md:p-12 shadow-lg">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <ScoreRing score={benchmark.compositeScore} />
            <div className="text-center md:text-left">
              <h2 className="font-sans text-2xl text-white mb-2">Treatment Room Score</h2>
              <p className="text-white/60 font-sans text-sm max-w-md leading-relaxed">
                Your composite benchmark across procurement health, inventory diversity, and
                reorder cadence — compared to {benchmark.peerGroupSize} peer operators in your segment.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
                <TrendingUp className="w-4 h-4 text-accent" />
                <span className="text-sm font-sans text-white/80">
                  Top {100 - Math.round(
                    benchmark.dimensions.reduce((sum, d) => sum + d.percentile, 0) / benchmark.dimensions.length
                  )}% of operators in your segment
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Dimension Breakdown (2x3 grid) ─────────────────── */}
        <div>
          <h2 className="font-sans text-xl text-graphite mb-4">Dimension Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {benchmark.dimensions.map((dim) => (
              <DimensionCard key={dim.dimension} dim={dim} />
            ))}
          </div>
        </div>

        {/* ── Category Coverage ───────────────────────────────── */}
        <div className="bg-white rounded-xl border border-accent-soft p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-sans text-xl text-graphite">Category Coverage</h2>
              <p className="text-sm text-graphite/60 font-sans mt-1">
                Your product count per category vs. peer average
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-sans text-graphite/60">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-accent" /> You
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-accent-soft" /> Peer Avg
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {categories.map((cat) => {
              const operatorPct = (cat.operatorCount / cat.maxPossible) * 100;
              const peerPct = (cat.peerAvg / cat.maxPossible) * 100;
              const isMissing = cat.operatorCount === 0;

              return (
                <div key={cat.category} className="group">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-sm font-sans ${isMissing ? 'text-signal-down font-medium' : 'text-graphite'}`}>
                      {cat.category}
                      {isMissing && (
                        <span className="ml-2 text-xs text-signal-down/80">— Not stocked</span>
                      )}
                    </span>
                    <span className="text-xs font-sans text-graphite/60">
                      {cat.operatorCount} / {cat.maxPossible}
                    </span>
                  </div>
                  <div className="relative w-full h-4 bg-accent-soft rounded-full overflow-hidden">
                    {/* Operator fill */}
                    <div
                      className={`absolute inset-y-0 left-0 rounded-full transition-all duration-700 ${isMissing ? 'bg-red-200' : 'bg-accent'}`}
                      style={{ width: `${Math.max(operatorPct, isMissing ? 2 : 0)}%` }}
                    />
                    {/* Peer avg marker */}
                    <div
                      className="absolute inset-y-0 w-0.5 bg-graphite/40"
                      style={{ left: `${peerPct}%` }}
                      title={`Peer avg: ${cat.peerAvg}`}
                    />
                  </div>
                  {isMissing && (
                    <button className="mt-1.5 text-xs font-sans font-medium text-accent hover:text-accent/80 flex items-center gap-1 transition-colors">
                      Browse this category <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Reorder Health Table ────────────────────────────── */}
        <div className="bg-white rounded-xl border border-accent-soft shadow-sm overflow-hidden">
          <div className="p-6 border-b border-accent-soft">
            <h2 className="font-sans text-xl text-graphite">Reorder Health</h2>
            <p className="text-sm text-graphite/60 font-sans mt-1">
              Track reorder cadence against your historical patterns
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="bg-accent-soft/50 text-graphite/60 text-left">
                  <th className="px-6 py-3 font-medium">Product</th>
                  <th className="px-6 py-3 font-medium">Brand</th>
                  <th className="px-6 py-3 font-medium text-right">Last Order</th>
                  <th className="px-6 py-3 font-medium text-right">Avg Cycle</th>
                  <th className="px-6 py-3 font-medium text-center">Status</th>
                  <th className="px-6 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-accent-soft/50">
                {reorderItems.map((item) => (
                  <tr key={`${item.brand}-${item.productName}`} className="hover:bg-accent-soft/30 transition-colors">
                    <td className="px-6 py-4 text-graphite font-medium">{item.productName}</td>
                    <td className="px-6 py-4 text-graphite/60">{item.brand}</td>
                    <td className="px-6 py-4 text-right text-graphite">{item.lastOrderDaysAgo}d ago</td>
                    <td className="px-6 py-4 text-right text-graphite/60">{item.avgReorderDays}d</td>
                    <td className="px-6 py-4 text-center">{statusBadge(item.status)}</td>
                    <td className="px-6 py-4 text-right">
                      {item.status === 'critical' && (
                        <button className="text-xs font-medium text-signal-down hover:text-signal-down/80 flex items-center gap-1 ml-auto transition-colors">
                          Reorder Now <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Actionable Intelligence ────────────────────────── */}
        {belowPeerDimensions.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-accent" />
              <h2 className="font-sans text-xl text-graphite">Actionable Intelligence</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {belowPeerDimensions.map((dim) => {
                const Icon = dimensionIcons[dim.dimension];
                return (
                  <div
                    key={dim.dimension}
                    className="bg-white rounded-xl border border-accent-soft p-6 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-sans font-semibold text-graphite text-sm mb-1">{dim.label}</h3>
                        <p className="text-sm text-graphite/60 font-sans leading-relaxed">
                          {dim.recommendation}
                        </p>
                        <div className="mt-3 flex items-center gap-3">
                          <span className="text-xs font-sans text-graphite/60">
                            Gap: {formatValue(Math.abs(dim.peerMedian - dim.operatorValue), dim.unit)} below peers
                          </span>
                          <button className="text-xs font-sans font-medium text-accent hover:text-accent/80 flex items-center gap-1 transition-colors">
                            Explore solutions <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
