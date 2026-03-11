import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../lib/auth';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Users,
  MapPin,
  AlertTriangle,
  Zap,
  BarChart3,
  DollarSign,
  Star,
  Wifi,
  WifiOff,
  Lock,
} from 'lucide-react';
import { Tabs, TabList, Tab, TabPanel } from '../../components/ui';
import {
  getBrandPerformanceMetrics,
  getResellerIntelligence,
  getBrandCategoryPosition,
  getBrandMarketPosition,
} from '../../lib/intelligence/brandPortalIntelligence';
import { useIntelligence } from '../../lib/intelligence/useIntelligence';
import type {
  SKUPerformance,
  OperatorData,
  CategoryPosition,
} from '../../lib/intelligence/brandPortalIntelligence';
import type { OperatorEnrichment } from '../../lib/enrichment/types';
import { Link } from 'react-router-dom';
import { useBrandTier } from '../../lib/brandTiers/useBrandTier';
import { CrossHubActionDispatcher } from '../../components/CrossHubActionDispatcher';

// ── Velocity / Status helpers ────────────────────────────────────

const VELOCITY_STYLES: Record<SKUPerformance['velocity'], { bg: string; text: string; label: string }> = {
  active:    { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Active' },
  declining: { bg: 'bg-amber-50',   text: 'text-amber-700',   label: 'Declining' },
  at_risk:   { bg: 'bg-red-50',     text: 'text-red-700',     label: 'At Risk' },
};

const OPERATOR_STATUS_STYLES: Record<OperatorData['status'], { bg: string; text: string; label: string }> = {
  active:    { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Active' },
  declining: { bg: 'bg-amber-50',   text: 'text-amber-700',   label: 'Declining' },
  at_risk:   { bg: 'bg-red-50',     text: 'text-red-700',     label: 'At Risk' },
  new:       { bg: 'bg-blue-50',    text: 'text-blue-700',     label: 'New' },
};

const TIER_STYLES: Record<string, string> = {
  Pro:        'bg-accent-soft/30 text-graphite',
  Premium:    'bg-accent/10 text-accent border border-accent/30',
  Enterprise: 'bg-purple-50 text-purple-700 border border-purple-200',
};

const POSITION_STYLES: Record<CategoryPosition['competitivePosition'], { bg: string; border: string }> = {
  leader:    { bg: 'bg-emerald-50 text-emerald-700', border: 'border-emerald-200' },
  contender: { bg: 'bg-blue-50 text-blue-700',       border: 'border-blue-200' },
  emerging:  { bg: 'bg-amber-50 text-amber-700',     border: 'border-amber-200' },
  niche:     { bg: 'bg-accent-soft text-graphite',  border: 'border-accent-soft' },
};

function deriveOperatorEnrichment(operator: OperatorData): OperatorEnrichment {
  const score = Math.max(
    18,
    Math.min(
      95,
      Math.round(
        operator.ordersLast90d * 4 +
        operator.productsCarried * 3 +
        operator.revenueLast90d / 500
      )
    )
  );

  const ratingByStatus: Record<OperatorData['status'], number> = {
    active: 4.6,
    declining: 4.1,
    at_risk: 3.6,
    new: 4.3,
  };

  const confidence = operator.ordersLast90d >= 10 ? 'medium' : 'low';
  const inferredReviewThemes = [
    'product selection',
    'treatment outcomes',
    operator.status === 'active' ? 'repeat purchasing' : 'service consistency',
  ];

  return {
    google_rating: ratingByStatus[operator.status],
    google_review_count: Math.max(8, operator.ordersLast90d * 6),
    review_themes: inferredReviewThemes,
    review_concerns: operator.status === 'at_risk' ? ['fulfillment lag'] : [],
    social_active: operator.status !== 'at_risk',
    social_brand_mentions: [],
    website_url: null,
    website_mentions_brands: [],
    has_online_booking: operator.status !== 'at_risk',
    service_menu_themes: [],
    digital_presence_score: score,
    yelp_rating: null,
    tripadvisor_rating: null,
    enrichment_date: operator.lastOrderDate,
    enrichment_confidence: confidence,
    provenance: [
      {
        source: 'google_reviews',
        provider: 'derived/operator-metrics',
        fetched_at: new Date().toISOString(),
        endpoint: null,
        confidence,
        status: 'degraded',
      },
    ],
  };
}

// ── Main Page ────────────────────────────────────────────────────

export default function BrandIntelligenceHub() {
  const { brandId } = useAuth();
  const slug = brandId || 'default';

  const position = getBrandMarketPosition(slug);
  const metrics = getBrandPerformanceMetrics(slug);
  const resellers = getResellerIntelligence(slug);
  const categoryData = getBrandCategoryPosition(slug);

  // W12-07: Wire market signals via useIntelligence() — live from market_signals table
  const { signals: allSignals, isLive: signalsIsLive, loading: signalsLoading } = useIntelligence();
  // Filter signals relevant to this brand (by related_brands array)
  const topSignals = allSignals.filter(
    (s) => s.related_brands && s.related_brands.length > 0
  ).slice(0, 4);

  // WO-24: Tier gating
  const { isFeatureLocked } = useBrandTier();
  const marketPositionLocked = isFeatureLocked('market_position');

  return (
    <>
      <Helmet>
        <title>Brand Intelligence | Socelle</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Brain className="w-6 h-6 text-accent" />
            <h1 className="font-heading text-2xl font-bold text-graphite">Brand Intelligence</h1>
            <span className="text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-pill">
              {signalsIsLive ? 'Live Signals + Demo Metrics' : 'Preview'}
            </span>
          </div>
          <p className="text-sm text-graphite/60 font-sans">
            Market position, operator insights, and category intelligence for your brand.
          </p>
        </div>

        {/* Position Summary Banner */}
        <div className="bg-graphite rounded-xl p-5 text-white">
          <div className="flex justify-end mb-2">
            <span className="text-[10px] font-semibold bg-signal-warn/20 text-signal-warn px-2 py-0.5 rounded-full">
              DEMO — Sample metrics. Live data in next release.
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <SummaryCell
              label="Category Rank"
              value={`#${position.categoryRanking}`}
              sub={`of ${position.totalInCategory} in ${position.categoryName}`}
            />
            <SummaryCell
              label="Adoption Rate"
              value={`${position.adoptionRate}%`}
              sub={`Category avg: ${position.categoryAvgAdoption}%`}
            />
            <SummaryCell
              label="Momentum"
              value={metrics.momentumScore.toString()}
              sub={
                <div className="w-full bg-white/20 rounded-full h-1.5 mt-1">
                  <div
                    className="bg-accent rounded-full h-1.5"
                    style={{ width: `${metrics.momentumScore}%` }}
                  />
                </div>
              }
            />
            <SummaryCell
              label="QoQ Growth"
              value={`${position.quarterOverQuarterGrowth > 0 ? '+' : ''}${position.quarterOverQuarterGrowth}%`}
              valueColor={position.quarterOverQuarterGrowth >= 0 ? 'text-emerald-400' : 'text-red-400'}
            />
            <SummaryCell
              label="Active Operators"
              value={resellers.activeOperators.toString()}
              sub={`of ${resellers.totalOperators} total`}
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultTab="performance">
          <TabList className="mb-6">
            <Tab id="performance">Brand Performance</Tab>
            <Tab id="resellers">Reseller Intelligence</Tab>
            <Tab id="market">Market Position</Tab>
          </TabList>

          {/* ── Tab 1: Brand Performance ─────────────────────── */}
          <TabPanel id="performance" className="space-y-6">
            <div className="flex justify-end">
              <span className="text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-full">
                DEMO — Sample performance data
              </span>
            </div>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {metrics.kpiCards.map((kpi) => (
                <div key={kpi.label} className="bg-white rounded-xl border border-accent-soft p-5 shadow-sm">
                  <p className="text-[10px] font-sans font-semibold text-graphite/60 uppercase tracking-widest mb-3">
                    {kpi.label}
                  </p>
                  <p className="text-2xl font-heading font-bold text-graphite">{kpi.value}</p>
                  {kpi.delta !== undefined && (
                    <div className={`flex items-center gap-1 mt-1.5 text-xs font-medium font-sans ${
                      kpi.delta >= 0 ? 'text-emerald-600' : 'text-red-500'
                    }`}>
                      {kpi.delta >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      <span>{kpi.delta > 0 ? '+' : ''}{kpi.delta}%</span>
                      {kpi.deltaLabel && (
                        <span className="text-graphite/60 font-normal ml-0.5">{kpi.deltaLabel}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Momentum Gauge */}
            <div className="bg-white rounded-xl border border-accent-soft p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-accent" />
                  <h3 className="font-sans font-semibold text-sm text-graphite">Brand Momentum Score</h3>
                </div>
                <span className="text-2xl font-heading font-bold text-graphite">
                  {metrics.momentumScore}<span className="text-sm text-graphite/60 font-sans font-normal"> / 100</span>
                </span>
              </div>
              <div className="w-full bg-accent-soft/30 rounded-full h-3">
                <div
                  className={`rounded-full h-3 transition-all ${
                    metrics.momentumScore >= 70 ? 'bg-emerald-500' :
                    metrics.momentumScore >= 40 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${metrics.momentumScore}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-[10px] text-graphite/60 font-sans">
                <span>Low</span>
                <span>Moderate</span>
                <span>Strong</span>
              </div>
            </div>

            {/* SKU Performance Table */}
            <div className="bg-white rounded-xl border border-accent-soft shadow-sm overflow-hidden">
              <div className="p-5 border-b border-accent-soft">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-graphite" />
                  <h3 className="font-sans font-semibold text-sm text-graphite">SKU Performance</h3>
                </div>
                <p className="text-xs text-graphite/60 font-sans mt-0.5">Last 90 days</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-sans">
                  <thead>
                    <tr className="border-b border-accent-soft bg-background/50">
                      <th className="text-left px-5 py-3 text-[10px] font-semibold text-graphite/60 uppercase tracking-wider">Product</th>
                      <th className="text-right px-5 py-3 text-[10px] font-semibold text-graphite/60 uppercase tracking-wider">Units (90d)</th>
                      <th className="text-right px-5 py-3 text-[10px] font-semibold text-graphite/60 uppercase tracking-wider">Reorder Rate</th>
                      <th className="text-right px-5 py-3 text-[10px] font-semibold text-graphite/60 uppercase tracking-wider">Revenue</th>
                      <th className="text-center px-5 py-3 text-[10px] font-semibold text-graphite/60 uppercase tracking-wider">Status</th>
                      <th className="text-right px-5 py-3 text-[10px] font-semibold text-graphite/60 uppercase tracking-wider">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-accent-soft/50">
                    {metrics.skuPerformance.map((sku) => {
                      const style = VELOCITY_STYLES[sku.velocity];
                      return (
                        <tr key={sku.id} className="hover:bg-accent-soft/30 transition-colors">
                          <td className="px-5 py-3">
                            <p className="font-medium text-graphite">{sku.name}</p>
                            <p className="text-xs text-graphite/60">{sku.category}</p>
                          </td>
                          <td className="px-5 py-3 text-right text-graphite">{sku.unitsLast90d}</td>
                          <td className="px-5 py-3 text-right text-graphite">{sku.reorderRate}%</td>
                          <td className="px-5 py-3 text-right font-medium text-graphite">
                            ${sku.revenueLast90d.toLocaleString()}
                          </td>
                          <td className="px-5 py-3 text-center">
                            <span className={`inline-flex text-[10px] px-2 py-0.5 rounded-full font-semibold ${style.bg} ${style.text}`}>
                              {style.label}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <div className="inline-flex items-center gap-1">
                              {sku.trend >= 0 ? (
                                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                              )}
                              <span className={`text-xs font-medium ${sku.trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                {sku.trend > 0 ? '+' : ''}{sku.trend}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Signals for this brand — LIVE via useIntelligence() when market_signals populated */}
            {signalsLoading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-5 bg-accent-soft rounded w-64" />
                <div className="grid gap-3 md:grid-cols-2">
                  {[1, 2].map((i) => <div key={i} className="h-28 bg-accent-soft rounded-lg" />)}
                </div>
              </div>
            ) : topSignals.length > 0 ? (
              <div className="space-y-3">
                {!signalsIsLive && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-signal-warn/10 rounded-lg border border-signal-warn/20">
                    <AlertTriangle className="w-3.5 h-3.5 text-signal-warn flex-shrink-0" />
                    <p className="text-[10px] font-sans text-signal-warn">
                      <span className="font-semibold">Preview</span> — Sample signals shown. Live data activates when market_signals is populated.
                    </p>
                  </div>
                )}
                <h3 className="font-sans font-semibold text-sm text-graphite flex items-center gap-2">
                  <Brain className="w-4 h-4 text-accent" />
                  Market Signals Relevant to Your Brand
                </h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {topSignals.slice(0, 4).map((signal) => (
                    <div
                      key={signal.id}
                      className="bg-white rounded-lg border border-accent-soft p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-sans font-medium text-sm text-graphite leading-tight">{signal.title}</h4>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <CrossHubActionDispatcher 
                            compact 
                            signal={{
                              id: signal.id,
                              title: signal.title,
                              category: signal.category || 'market',
                              delta: signal.magnitude,
                              confidence: 90,
                              source: signal.source || 'system'
                            }} 
                          />
                          <div className={`flex items-center gap-1 text-xs font-medium font-sans px-2 py-0.5 rounded-full ${
                            signal.direction === 'up'
                              ? 'bg-emerald-50 text-emerald-700'
                              : signal.direction === 'down'
                              ? 'bg-red-50 text-red-700'
                              : 'bg-accent-soft text-graphite/60'
                          }`}>
                            {signal.direction === 'up' ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : signal.direction === 'down' ? (
                              <TrendingDown className="w-3 h-3" />
                            ) : null}
                            {signal.magnitude > 0 ? `${signal.direction === 'down' ? '-' : '+'}${signal.magnitude}%` : 'Stable'}
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-graphite/60 font-sans line-clamp-2">{signal.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </TabPanel>

          {/* ── Tab 2: Reseller Intelligence ──────────────────── */}
          <TabPanel id="resellers" className="space-y-6">
            <div className="flex justify-end">
              <span className="text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-full">
                DEMO — Sample reseller data
              </span>
            </div>
            {/* Summary Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <SummaryStatCard icon={Users} label="Total Operators" value={resellers.totalOperators} />
              <SummaryStatCard icon={TrendingUp} label="Active" value={resellers.activeOperators} valueColor="text-emerald-600" />
              <SummaryStatCard icon={AlertTriangle} label="At Risk" value={resellers.atRiskOperators.length} valueColor="text-red-500" />
              <SummaryStatCard
                icon={DollarSign}
                label="Avg Monthly Spend"
                value={`$${Math.round(
                  resellers.operators.reduce((s, o) => s + o.revenueLast90d, 0) / Math.max(resellers.operators.length, 1) / 3
                ).toLocaleString()}`}
              />
            </div>

            {/* Operator Table */}
            <div className="bg-white rounded-xl border border-accent-soft shadow-sm overflow-hidden">
              <div className="p-5 border-b border-accent-soft">
                <h3 className="font-sans font-semibold text-sm text-graphite">Operator Network</h3>
                <p className="text-xs text-graphite/60 font-sans mt-0.5">Sorted by revenue contribution</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm font-sans">
                  <thead>
                    <tr className="border-b border-accent-soft bg-background/50">
                      <th className="text-left px-5 py-3 text-[10px] font-semibold text-graphite/60 uppercase tracking-wider">Operator</th>
                      <th className="text-left px-5 py-3 text-[10px] font-semibold text-graphite/60 uppercase tracking-wider">Region</th>
                      <th className="text-center px-5 py-3 text-[10px] font-semibold text-graphite/60 uppercase tracking-wider">Tier</th>
                      <th className="text-center px-5 py-3 text-[10px] font-semibold text-graphite/60 uppercase tracking-wider">Enrichment</th>
                      <th className="text-right px-5 py-3 text-[10px] font-semibold text-graphite/60 uppercase tracking-wider">Last Order</th>
                      <th className="text-right px-5 py-3 text-[10px] font-semibold text-graphite/60 uppercase tracking-wider">Orders (90d)</th>
                      <th className="text-center px-5 py-3 text-[10px] font-semibold text-graphite/60 uppercase tracking-wider">Status</th>
                      <th className="text-right px-5 py-3 text-[10px] font-semibold text-graphite/60 uppercase tracking-wider">Revenue (90d)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-accent-soft/50">
                    {resellers.operators
                      .sort((a, b) => b.revenueLast90d - a.revenueLast90d)
                      .map((op) => {
                        const statusStyle = OPERATOR_STATUS_STYLES[op.status];
                        const tierStyle = TIER_STYLES[op.tier] || TIER_STYLES.Pro;
                        const lastOrderDays = Math.round(
                          (Date.now() - new Date(op.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24)
                        );
                        const opEnrichment = deriveOperatorEnrichment(op);
                        return (
                          <tr key={op.id} className="hover:bg-accent-soft/30 transition-colors">
                            <td className="px-5 py-3">
                              <p className="font-medium text-graphite">{op.name}</p>
                              <p className="text-xs text-graphite/60">{op.productsCarried} products carried</p>
                            </td>
                            <td className="px-5 py-3 text-graphite/60">{op.region}</td>
                            <td className="px-5 py-3 text-center">
                              <span className={`inline-flex text-[10px] px-2 py-0.5 rounded-full font-semibold ${tierStyle}`}>
                                {op.tier}
                              </span>
                            </td>
                            <td className="px-5 py-3">
                              <OperatorEnrichmentBadges enrichment={opEnrichment} />
                            </td>
                            <td className="px-5 py-3 text-right text-graphite/60">
                              {lastOrderDays}d ago
                            </td>
                            <td className="px-5 py-3 text-right text-graphite">{op.ordersLast90d}</td>
                            <td className="px-5 py-3 text-center">
                              <span className={`inline-flex text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusStyle.bg} ${statusStyle.text}`}>
                                {statusStyle.label}
                              </span>
                            </td>
                            <td className="px-5 py-3 text-right font-medium text-graphite">
                              ${op.revenueLast90d.toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Growth Opportunities */}
            {resellers.growthOpportunities.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-sans font-semibold text-sm text-graphite flex items-center gap-2">
                  <Zap className="w-4 h-4 text-accent" />
                  Growth Opportunities
                </h3>
                <div className="grid gap-4 md:grid-cols-3">
                  {resellers.growthOpportunities.map((opp) => (
                    <div key={opp.segment} className="bg-white rounded-xl border border-accent-soft p-5 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-sans font-semibold text-sm text-graphite">{opp.segment}</h4>
                        <span className="text-xs font-medium text-accent font-sans">{opp.potentialRevenue}</span>
                      </div>
                      <p className="text-xs text-graphite/60 font-sans line-clamp-3 mb-3">{opp.description}</p>
                      <p className="text-xs text-graphite/60 font-sans">
                        {opp.operatorCount} operators identified
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Geographic + Tier Distribution */}
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl border border-accent-soft p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-4 h-4 text-graphite" />
                  <h3 className="font-sans font-semibold text-sm text-graphite">Geographic Distribution</h3>
                </div>
                <div className="space-y-3">
                  {resellers.geographicDistribution.map((region) => (
                    <div key={region.region}>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-sans text-graphite">{region.region}</p>
                        <p className="text-xs text-graphite/60 font-sans">{region.count} ({region.percentage}%)</p>
                      </div>
                      <div className="w-full bg-accent-soft/30 rounded-full h-1.5">
                        <div className="bg-graphite rounded-full h-1.5" style={{ width: `${region.percentage}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-accent-soft p-5 shadow-sm">
                <h3 className="font-sans font-semibold text-sm text-graphite mb-4">Tier Distribution</h3>
                <div className="flex gap-4">
                  {resellers.tierDistribution.map((tier) => {
                    const style = TIER_STYLES[tier.tier] || TIER_STYLES.Pro;
                    return (
                      <div key={tier.tier} className={`flex-1 rounded-xl p-4 text-center ${style}`}>
                        <p className="text-3xl font-heading font-bold">{tier.count}</p>
                        <p className="text-xs font-sans font-semibold uppercase tracking-wider mt-1">{tier.tier}</p>
                        <p className="text-[10px] font-sans text-graphite/60 mt-0.5">{tier.percentage}%</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </TabPanel>

          {/* ── Tab 3: Market Position ────────────────────────── */}
          <TabPanel id="market" className="space-y-6">
            <div className="flex justify-end">
              <span className="text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-full">
                DEMO — Sample category data
              </span>
            </div>
            {/* WO-24: Enterprise tier gate overlay */}
            {marketPositionLocked && (
              <div className="relative">
                <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-10 rounded-xl flex flex-col items-center justify-center gap-3 min-h-[200px]">
                  <div className="bg-graphite/10 rounded-full p-3">
                    <Lock className="w-6 h-6 text-graphite" />
                  </div>
                  <p className="text-sm font-semibold text-graphite">
                    Enterprise Intelligence Feature
                  </p>
                  <p className="text-xs text-graphite/60 max-w-sm text-center">
                    Market Position analysis, competitive benchmarks, and category rankings are available on the Enterprise plan.
                  </p>
                  <Link
                    to="/brand/intelligence-pricing"
                    className="mt-1 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-graphite text-white text-sm font-medium hover:bg-graphite/90 transition-colors"
                  >
                    <Zap className="w-4 h-4" />
                    Upgrade to Enterprise
                  </Link>
                </div>
              </div>
            )}
            {/* Overall Position Summary */}
            <div className="bg-white rounded-xl border border-accent-soft p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <Brain className="w-5 h-5 text-accent" />
                <h3 className="font-heading text-lg font-semibold text-graphite">Overall Market Position</h3>
              </div>
              <p className="text-sm text-graphite/60 font-sans">{categoryData.overallMarketPosition}</p>
              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-accent-soft">
                <div>
                  <p className="text-xs text-graphite/60 font-sans uppercase tracking-wider mb-1">Primary Category</p>
                  <p className="font-sans font-medium text-graphite">{position.categoryName}</p>
                </div>
                <div>
                  <p className="text-xs text-graphite/60 font-sans uppercase tracking-wider mb-1">Momentum Score</p>
                  <p className="font-sans font-medium text-graphite">{metrics.momentumScore} / 100</p>
                </div>
                <div>
                  <p className="text-xs text-graphite/60 font-sans uppercase tracking-wider mb-1">Total Categories</p>
                  <p className="font-sans font-medium text-graphite">{categoryData.categories.length}</p>
                </div>
              </div>
            </div>

            {/* Category Ranking Cards */}
            <div className="space-y-3">
              <h3 className="font-sans font-semibold text-sm text-graphite">Category Rankings</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {categoryData.categories.map((cat) => {
                  const posStyle = POSITION_STYLES[cat.competitivePosition];
                  return (
                    <div key={cat.categoryName} className="bg-white rounded-xl border border-accent-soft p-5 shadow-sm">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-heading text-lg font-semibold text-graphite">{cat.categoryName}</h4>
                          <span className={`inline-flex text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize mt-1 border ${posStyle.bg} ${posStyle.border}`}>
                            {cat.competitivePosition}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-heading font-bold text-graphite">#{cat.rank}</p>
                          <p className="text-xs text-graphite/60 font-sans">of {cat.totalBrands} brands</p>
                        </div>
                      </div>

                      {/* Adoption bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs font-sans mb-1">
                          <span className="text-graphite font-medium">Your adoption: {cat.adoptionRate}%</span>
                          <span className="text-graphite/60">Category avg: {cat.categoryAvg}%</span>
                        </div>
                        <div className="relative w-full bg-accent-soft/30 rounded-full h-2">
                          {/* Category avg marker */}
                          <div
                            className="absolute top-0 h-2 w-0.5 bg-graphite/60 rounded-full z-10"
                            style={{ left: `${cat.categoryAvg}%` }}
                          />
                          <div
                            className={`rounded-full h-2 ${
                              cat.adoptionRate >= cat.categoryAvg ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${cat.adoptionRate}%` }}
                          />
                        </div>
                      </div>

                      {/* Treatment Trend Impact */}
                      <div className="bg-background rounded-lg p-3 mt-3">
                        <p className="text-[10px] font-semibold text-graphite/60 font-sans uppercase tracking-wider mb-1">
                          Treatment Trend Impact
                        </p>
                        <p className="text-xs text-graphite font-sans">{cat.treatmentTrendImpact}</p>
                      </div>

                      {/* Competitive Context */}
                      <p className="text-xs text-graphite/60 font-sans italic mt-3">{cat.competitiveContext}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Revenue Trend */}
            <div className="bg-white rounded-xl border border-accent-soft p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-graphite" />
                <h3 className="font-sans font-semibold text-sm text-graphite">12-Month Revenue Trend</h3>
              </div>
              <div className="h-32 flex items-end gap-1">
                {metrics.revenueTrend.map((val, i) => {
                  const max = Math.max(...metrics.revenueTrend);
                  const pct = (val / max) * 100;
                  const isLast = i === metrics.revenueTrend.length - 1;
                  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                      <div
                        className={`w-full rounded-t-sm transition-all ${
                          isLast ? 'bg-graphite' : 'bg-accent-soft group-hover:bg-graphite/40'
                        }`}
                        style={{ height: `${Math.max(pct, 3)}%` }}
                        title={`$${val.toLocaleString()}`}
                      />
                      <span className="text-[8px] text-graphite/60 font-sans">{months[i]}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabPanel>
        </Tabs>
      </div>
    </>
  );
}

// ── Operator Enrichment Badges (WO-16) ────────────────────────────

function OperatorEnrichmentBadges({ enrichment }: { enrichment: OperatorEnrichment }) {
  return (
    <div className="flex items-center gap-2 justify-center">
      {/* Google Rating Mini-Badge */}
      {enrichment.google_rating !== null && (
        <div className="flex items-center gap-0.5 bg-accent-soft px-1.5 py-0.5 rounded-full" title={`Google: ${enrichment.google_rating} (${enrichment.google_review_count} reviews)`}>
          <Star className="w-3 h-3 text-accent fill-accent" />
          <span className="text-[10px] font-sans font-semibold text-graphite">
            {enrichment.google_rating.toFixed(1)}
          </span>
        </div>
      )}

      {/* Digital Presence Score Mini-Indicator */}
      <div
        className="flex items-center gap-1"
        title={`Digital presence: ${enrichment.digital_presence_score}/100`}
      >
        <div className="w-8 bg-accent-soft/30 rounded-full h-1.5">
          <div
            className={`rounded-full h-1.5 ${
              enrichment.digital_presence_score >= 70
                ? 'bg-emerald-500'
                : enrichment.digital_presence_score >= 40
                ? 'bg-amber-500'
                : 'bg-red-400'
            }`}
            style={{ width: `${enrichment.digital_presence_score}%` }}
          />
        </div>
        <span className="text-[9px] font-sans text-graphite/60">
          {enrichment.digital_presence_score}
        </span>
      </div>

      {/* Social Activity Indicator */}
      {enrichment.social_active ? (
        <span title="Socially active">
          <Wifi className="w-3 h-3 text-emerald-500" />
        </span>
      ) : (
        <span title="Socially inactive">
          <WifiOff className="w-3 h-3 text-accent-soft" />
        </span>
      )}
    </div>
  );
}

// ── Helper Components ────────────────────────────────────────────

function SummaryCell({
  label,
  value,
  sub,
  valueColor = 'text-white',
}: {
  label: string;
  value: string;
  sub?: React.ReactNode;
  valueColor?: string;
}) {
  return (
    <div className="bg-white/10 rounded-lg p-3">
      <p className="text-[10px] text-white/60 font-sans uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-xl font-heading font-bold ${valueColor}`}>{value}</p>
      {typeof sub === 'string' ? (
        <p className="text-[10px] text-white/50 font-sans mt-0.5">{sub}</p>
      ) : (
        sub
      )}
    </div>
  );
}

function SummaryStatCard({
  icon: Icon,
  label,
  value,
  valueColor = 'text-graphite',
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
  valueColor?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-accent-soft p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-graphite/60" />
        <p className="text-[10px] font-sans font-semibold text-graphite/60 uppercase tracking-widest">{label}</p>
      </div>
      <p className={`text-2xl font-heading font-bold ${valueColor}`}>{value}</p>
    </div>
  );
}
