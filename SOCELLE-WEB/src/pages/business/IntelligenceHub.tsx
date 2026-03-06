import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  BookOpen,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  Sparkles,
  GraduationCap,
  Layers,
  Star,
  Globe,
  Wifi,
  WifiOff,
  RefreshCw,
  Shield,
} from 'lucide-react';
import {
  getOperatorPerformance,
  getProductIntelligence,
  getMarketSignalsForOperator,
  getRelevantEducation,
  getOperatorInsights,
} from '../../lib/intelligence/businessIntelligence';
import type {
  ReorderHealth,
  WhitespaceOpportunity,
  UpsellSuggestion,
  ProductMixItem,
} from '../../lib/intelligence/businessIntelligence';
import type { IntelligenceSignal } from '../../lib/intelligence/types';
import type { EducationContent } from '../../lib/education/types';
import { useOperatorEnrichment } from '../../lib/enrichment/useEnrichment';

type TabId = 'performance' | 'products' | 'market' | 'education';

const TABS: { id: TabId; label: string; icon: typeof BarChart3 }[] = [
  { id: 'performance', label: 'My Performance',       icon: BarChart3 },
  { id: 'products',    label: 'Product Intelligence',  icon: Layers },
  { id: 'market',      label: 'Market Intelligence',   icon: TrendingUp },
  { id: 'education',   label: 'Education',             icon: GraduationCap },
];

export default function IntelligenceHub() {
  const [activeTab, setActiveTab] = useState<TabId>('performance');

  return (
    <>
      <Helmet>
        <title>Intelligence Hub | Socelle</title>
        <meta name="description" content="Your personalized professional beauty intelligence dashboard. Performance metrics, product insights, market signals, and CE education." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-intel-dark flex items-center justify-center">
              <Brain className="w-5 h-5 text-intel-accent" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold text-pro-charcoal">Intelligence Hub</h1>
              <p className="text-sm text-pro-warm-gray font-sans">Personalized signals for your treatment room</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-pro-stone">
          <nav className="flex space-x-1 -mb-px">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium text-sm font-sans transition-colors ${
                    isActive
                      ? 'border-pro-gold text-pro-charcoal'
                      : 'border-transparent text-pro-warm-gray hover:text-pro-charcoal hover:border-pro-stone'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[500px]">
          {activeTab === 'performance' && <PerformanceTab />}
          {activeTab === 'products' && <ProductIntelligenceTab />}
          {activeTab === 'market' && <MarketIntelligenceTab />}
          {activeTab === 'education' && <EducationTab />}
        </div>
      </div>
    </>
  );
}

// ── Tab 1: My Performance ──────────────────────────────────────────

function PerformanceTab() {
  const perf = getOperatorPerformance();
  const insights = getOperatorInsights();

  return (
    <div className="space-y-8">
      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-pro-stone rounded-xl overflow-hidden border border-pro-stone">
        <div className="bg-white p-6">
          <p className="text-xs font-sans font-medium text-pro-warm-gray uppercase tracking-wider mb-2">This Quarter Spend</p>
          <p className="text-3xl font-sans font-semibold text-pro-charcoal tracking-tight">
            ${perf.totalSpendThisQuarter.toLocaleString()}
          </p>
          <div className="flex items-center gap-1 mt-1">
            {perf.spendChangeVsLastQuarter > 0 ? (
              <TrendingUp className="w-3.5 h-3.5 text-intel-up" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 text-intel-down" />
            )}
            <span className={`text-xs font-sans font-medium ${perf.spendChangeVsLastQuarter > 0 ? 'text-intel-up' : 'text-intel-down'}`}>
              {perf.spendChangeVsLastQuarter > 0 ? '+' : ''}{perf.spendChangeVsLastQuarter}% vs last quarter
            </span>
          </div>
        </div>
        <div className="bg-white p-6">
          <p className="text-xs font-sans font-medium text-pro-warm-gray uppercase tracking-wider mb-2">Brand Diversity</p>
          <p className="text-3xl font-sans font-semibold text-pro-charcoal tracking-tight">
            {perf.brandDiversity.length}
          </p>
          <p className="text-xs font-sans text-pro-warm-gray mt-1">active brands in your back bar</p>
        </div>
        <div className="bg-white p-6">
          <p className="text-xs font-sans font-medium text-pro-warm-gray uppercase tracking-wider mb-2">Momentum Score</p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-sans font-semibold text-pro-charcoal tracking-tight">{perf.momentumScore}</p>
            <span className="text-sm font-sans text-pro-warm-gray">/100</span>
          </div>
          <div className="w-full bg-pro-cream rounded-sm h-2 mt-3">
            <div
              className={`h-2 rounded-sm transition-all duration-700 ease-out ${
                perf.momentumScore >= 70 ? 'bg-intel-up' : perf.momentumScore >= 40 ? 'bg-pro-gold' : 'bg-intel-down'
              }`}
              style={{ width: `${perf.momentumScore}%` }}
            />
          </div>
          <p className="text-xs font-sans text-pro-warm-gray mt-1">{perf.momentumLabel}</p>
        </div>
      </div>

      {/* Spending Chart (simplified bar chart) */}
      <div className="bg-white rounded-xl border border-pro-stone p-6">
        <h3 className="font-sans font-semibold text-pro-charcoal text-base mb-4">Spending Trend</h3>
        <div className="flex items-end gap-3 h-40">
          {perf.spendingPatterns.map((item) => {
            const maxAmount = Math.max(...perf.spendingPatterns.map(p => p.amount));
            const heightPct = (item.amount / maxAmount) * 100;
            return (
              <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-[10px] font-sans font-medium text-pro-warm-gray">
                  ${(item.amount / 1000).toFixed(1)}k
                </span>
                <div className="w-full relative" style={{ height: '120px' }}>
                  <div
                    className="absolute bottom-0 w-full bg-pro-navy/80 rounded-t-md transition-all duration-500"
                    style={{ height: `${heightPct}%` }}
                  />
                </div>
                <span className="text-xs font-sans text-pro-warm-gray">{item.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Brand Diversity Breakdown */}
        <div className="bg-white rounded-xl border border-pro-stone p-6">
          <h3 className="font-sans font-semibold text-pro-charcoal text-base mb-4">Brand Diversity</h3>
          <div className="space-y-3">
            {perf.brandDiversity.map((brand) => (
              <div key={brand.brandName} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: brand.color }} />
                <span className="text-sm font-sans text-pro-charcoal flex-1">{brand.brandName}</span>
                <div className="w-24 bg-pro-cream rounded-sm h-2">
                  <div
                    className="h-2 rounded-sm"
                    style={{ width: `${brand.percentage}%`, backgroundColor: brand.color }}
                  />
                </div>
                <span className="text-xs font-sans font-medium text-pro-warm-gray w-8 text-right">{brand.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reorder Health */}
        <div className="bg-white rounded-xl border border-pro-stone p-6">
          <h3 className="font-sans font-semibold text-pro-charcoal text-base mb-4">Reorder Health</h3>
          <div className="space-y-3">
            {perf.reorderHealth.map((item) => (
              <ReorderHealthRow key={item.productName} item={item} />
            ))}
          </div>
        </div>
      </div>

      {/* Top Insights */}
      <div>
        <h3 className="font-sans font-semibold text-pro-charcoal text-base mb-4">Your Top Insights</h3>
        <div className="space-y-3">
          {insights.slice(0, 3).map((insight) => (
            <div key={insight.id} className="bg-white rounded-xl border border-pro-stone p-5 flex items-start gap-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                insight.urgency === 'high' ? 'bg-amber-50' : 'bg-pro-cream'
              }`}>
                {insight.category === 'risk' ? (
                  <AlertTriangle className={`w-4 h-4 ${insight.urgency === 'high' ? 'text-amber-600' : 'text-pro-warm-gray'}`} />
                ) : insight.category === 'growth' ? (
                  <TrendingUp className="w-4 h-4 text-pro-gold" />
                ) : (
                  <Sparkles className="w-4 h-4 text-intel-accent" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-sans font-semibold text-pro-charcoal text-sm">{insight.title}</h4>
                <p className="text-xs text-pro-warm-gray font-sans mt-1 leading-relaxed line-clamp-2">{insight.description}</p>
                {insight.actionLabel && insight.actionHref && (
                  <Link
                    to={insight.actionHref}
                    className="inline-flex items-center gap-1 mt-2 text-xs font-medium font-sans text-pro-navy hover:text-pro-gold transition-colors"
                  >
                    {insight.actionLabel}
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReorderHealthRow({ item }: { item: ReorderHealth }) {
  const statusConfig: Record<ReorderHealth['status'], { icon: typeof CheckCircle; cls: string; label: string }> = {
    healthy:  { icon: CheckCircle,   cls: 'text-intel-up',   label: 'Healthy' },
    warning:  { icon: Clock,         cls: 'text-amber-500',  label: 'Reorder soon' },
    overdue:  { icon: AlertTriangle, cls: 'text-intel-down', label: 'Overdue' },
  };
  const config = statusConfig[item.status];
  const Icon = config.icon;

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-pro-stone hover:bg-pro-cream/50 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="font-sans font-medium text-pro-charcoal text-sm truncate">{item.productName}</p>
        <p className="text-xs text-pro-warm-gray font-sans">{item.brandName} · {item.daysSinceOrder}d since last order</p>
      </div>
      <div className={`flex items-center gap-1.5 flex-shrink-0 ${config.cls}`}>
        <Icon className="w-3.5 h-3.5" />
        <span className="text-xs font-sans font-medium">{config.label}</span>
      </div>
    </div>
  );
}

// ── Tab 2: Product Intelligence ────────────────────────────────────

function ProductIntelligenceTab() {
  const intel = getProductIntelligence();

  return (
    <div className="space-y-8">
      {/* Product Mix vs Peers */}
      <div className="bg-white rounded-xl border border-pro-stone p-6">
        <h3 className="font-sans font-semibold text-pro-charcoal text-base mb-1">Product Mix vs. Peer Average</h3>
        <p className="text-xs text-pro-warm-gray font-sans mb-5">How your category spend compares to similar operators on Socelle</p>
        <div className="space-y-4">
          {intel.productMixVsPeers.map((item) => (
            <ProductMixRow key={item.category} item={item} />
          ))}
        </div>
      </div>

      {/* Whitespace Opportunities */}
      <div>
        <h3 className="font-sans font-semibold text-pro-charcoal text-base mb-1">Whitespace Opportunities</h3>
        <p className="text-xs text-pro-warm-gray font-sans mb-4">Categories your peer group stocks that you haven&apos;t explored yet</p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {intel.whitespaceOpportunities.map((opp) => (
            <WhitespaceCard key={opp.id} opportunity={opp} />
          ))}
        </div>
      </div>

      {/* Upsell Suggestions */}
      <div>
        <h3 className="font-sans font-semibold text-pro-charcoal text-base mb-1">Upsell Suggestions</h3>
        <p className="text-xs text-pro-warm-gray font-sans mb-4">Upgrade paths that improve your margins</p>
        <div className="space-y-3">
          {intel.upsellSuggestions.map((suggestion) => (
            <UpsellCard key={suggestion.id} suggestion={suggestion} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductMixRow({ item }: { item: ProductMixItem }) {
  const diff = item.yourPct - item.peerAvgPct;
  return (
    <div className="flex items-center gap-4">
      <span className="text-sm font-sans text-pro-charcoal w-40 flex-shrink-0">{item.category}</span>
      <div className="flex-1 flex items-center gap-3">
        <div className="flex-1 bg-pro-cream rounded-sm h-3 relative">
          <div
            className="absolute top-0 h-3 bg-pro-navy/70 rounded-sm"
            style={{ width: `${item.yourPct}%` }}
          />
          <div
            className="absolute top-0 h-3 border-r-2 border-dashed border-pro-gold"
            style={{ width: `${item.peerAvgPct}%` }}
          />
        </div>
        <div className="flex items-center gap-2 w-32 flex-shrink-0">
          <span className="text-xs font-sans font-medium text-pro-charcoal">{item.yourPct}%</span>
          <span className="text-xs font-sans text-pro-warm-gray">vs {item.peerAvgPct}%</span>
          {diff !== 0 && (
            <span className={`text-[10px] font-sans font-medium ${diff > 0 ? 'text-intel-up' : 'text-intel-down'}`}>
              {diff > 0 ? '+' : ''}{diff}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function WhitespaceCard({ opportunity }: { opportunity: WhitespaceOpportunity }) {
  return (
    <div className="bg-pro-charcoal rounded-xl p-5 border-l-4 border-l-pro-gold flex flex-col justify-between">
      <div>
        <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-pro-gold">{opportunity.category}</span>
        <h4 className="font-sans font-semibold text-white text-sm mt-2 mb-2">{opportunity.title}</h4>
        <p className="text-xs text-pro-stone/80 font-sans leading-relaxed line-clamp-3">{opportunity.description}</p>
      </div>
      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-white/10 rounded-sm h-1.5">
            <div className="h-1.5 bg-pro-gold rounded-sm" style={{ width: `${opportunity.peerAdoptionPct}%` }} />
          </div>
          <span className="text-[10px] font-sans font-medium text-pro-gold">{opportunity.peerAdoptionPct}% peers</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {opportunity.topBrands.map((brand) => (
            <span key={brand} className="text-[10px] font-sans text-pro-stone/60 bg-white/5 px-2 py-0.5 rounded-full">{brand}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function UpsellCard({ suggestion }: { suggestion: UpsellSuggestion }) {
  return (
    <div className="bg-white rounded-xl border border-pro-stone p-5 flex items-start gap-4">
      <div className="w-8 h-8 rounded-lg bg-intel-accent/10 flex items-center justify-center flex-shrink-0">
        <TrendingUp className="w-4 h-4 text-intel-accent" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-sans text-pro-warm-gray line-through">{suggestion.currentProduct}</span>
          <ArrowRight className="w-3 h-3 text-pro-warm-gray" />
          <span className="text-sm font-sans font-medium text-pro-charcoal">{suggestion.suggestedProduct}</span>
        </div>
        <p className="text-xs font-sans text-pro-warm-gray">{suggestion.suggestedBrand}</p>
        <p className="text-xs text-pro-warm-gray/80 font-sans mt-2 leading-relaxed">{suggestion.reason}</p>
        <span className="inline-block mt-2 text-[10px] font-sans font-semibold text-intel-up bg-intel-up/10 px-2 py-0.5 rounded-full">
          {suggestion.marginUplift}
        </span>
      </div>
    </div>
  );
}

// ── Tab 3: Market Intelligence ─────────────────────────────────────

function MarketIntelligenceTab() {
  const signals = getMarketSignalsForOperator();
  const [filter, setFilter] = useState<string>('all');

  const signalTypes = ['all', ...new Set(signals.map(s => s.signal_type))];

  const filtered = filter === 'all'
    ? signals
    : signals.filter(s => s.signal_type === filter);

  const typeLabels: Record<string, string> = {
    all: 'All Signals',
    product_velocity: 'Product Velocity',
    treatment_trend: 'Treatment Trends',
    ingredient_momentum: 'Ingredients',
    regional: 'Regional',
    pricing_benchmark: 'Pricing',
    brand_adoption: 'Brand Adoption',
    regulatory_alert: 'Regulatory',
    education: 'Education',
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {signalTypes.map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-colors ${
              filter === type
                ? 'bg-pro-charcoal text-white'
                : 'bg-pro-cream text-pro-warm-gray hover:bg-pro-stone'
            }`}
          >
            {typeLabels[type] || type}
          </button>
        ))}
      </div>

      {/* Signal Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((signal) => (
          <SignalCard key={signal.id} signal={signal} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-pro-warm-gray font-sans">No signals match this filter.</p>
        </div>
      )}

      {/* ── Enrichment Profile (WO-16) ────────────────────── */}
      <EnrichmentProfileSection />
    </div>
  );
}

// ── Enrichment Profile Section (WO-16) ─────────────────────────────

function EnrichmentProfileSection() {
  // V1: Uses a demo operator ID; V2: pull from auth context
  const { data: enrichment, loading, daysSinceEnrichment, refreshEnrichment } =
    useOperatorEnrichment('op-001');

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-pro-stone p-6 animate-pulse">
        <div className="h-5 bg-pro-cream rounded w-48 mb-4" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-20 bg-pro-cream rounded" />
          <div className="h-20 bg-pro-cream rounded" />
        </div>
      </div>
    );
  }

  if (!enrichment) return null;

  const confidenceStyles: Record<string, { bg: string; text: string }> = {
    high:   { bg: 'bg-emerald-50', text: 'text-emerald-700' },
    medium: { bg: 'bg-amber-50',   text: 'text-amber-700' },
    low:    { bg: 'bg-red-50',     text: 'text-red-700' },
  };
  const conf = confidenceStyles[enrichment.enrichment_confidence] || confidenceStyles.low;

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-pro-navy" />
          <h3 className="font-sans font-semibold text-pro-charcoal text-base">
            Your Enrichment Profile
          </h3>
          <span className={`text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full ${conf.bg} ${conf.text}`}>
            {enrichment.enrichment_confidence} confidence
          </span>
        </div>
        <div className="flex items-center gap-3">
          {daysSinceEnrichment !== null && (
            <span className="text-xs text-pro-warm-gray font-sans">
              Last enriched: {daysSinceEnrichment === 0 ? 'today' : `${daysSinceEnrichment}d ago`}
            </span>
          )}
          <button
            onClick={refreshEnrichment}
            className="flex items-center gap-1.5 text-xs font-sans font-medium text-pro-navy hover:text-pro-gold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Top Row: Ratings + Digital Presence */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Google Rating */}
        <div className="bg-white rounded-xl border border-pro-stone p-5">
          <p className="text-[10px] font-sans font-semibold text-pro-warm-gray uppercase tracking-wider mb-3">
            Google Rating
          </p>
          {enrichment.google_rating !== null ? (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl font-sans font-semibold text-pro-charcoal">
                  {enrichment.google_rating.toFixed(1)}
                </span>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.round(enrichment.google_rating!)
                          ? 'text-pro-gold fill-pro-gold'
                          : 'text-pro-stone'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-pro-warm-gray font-sans">
                {enrichment.google_review_count?.toLocaleString()} reviews
              </p>
            </div>
          ) : (
            <p className="text-sm text-pro-warm-gray font-sans">Not found</p>
          )}
        </div>

        {/* Other Platforms */}
        <div className="bg-white rounded-xl border border-pro-stone p-5">
          <p className="text-[10px] font-sans font-semibold text-pro-warm-gray uppercase tracking-wider mb-3">
            Review Platforms
          </p>
          <div className="space-y-2">
            {enrichment.yelp_rating !== null && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-sans text-pro-charcoal">Yelp</span>
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-pro-gold fill-pro-gold" />
                  <span className="text-sm font-sans font-medium text-pro-charcoal">
                    {enrichment.yelp_rating.toFixed(1)}
                  </span>
                </div>
              </div>
            )}
            {enrichment.tripadvisor_rating !== null && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-sans text-pro-charcoal">TripAdvisor</span>
                <div className="flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 text-pro-gold fill-pro-gold" />
                  <span className="text-sm font-sans font-medium text-pro-charcoal">
                    {enrichment.tripadvisor_rating.toFixed(1)}
                  </span>
                </div>
              </div>
            )}
            {enrichment.yelp_rating === null && enrichment.tripadvisor_rating === null && (
              <p className="text-xs text-pro-warm-gray font-sans">No additional platform data</p>
            )}
          </div>
        </div>

        {/* Digital Presence Score */}
        <div className="bg-white rounded-xl border border-pro-stone p-5">
          <p className="text-[10px] font-sans font-semibold text-pro-warm-gray uppercase tracking-wider mb-3">
            Digital Presence Score
          </p>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-2xl font-sans font-semibold text-pro-charcoal">
              {enrichment.digital_presence_score}
            </span>
            <span className="text-sm font-sans text-pro-warm-gray">/ 100</span>
          </div>
          <div className="w-full bg-pro-cream rounded-sm h-2.5">
            <div
              className={`h-2.5 rounded-sm transition-all duration-700 ease-out ${
                enrichment.digital_presence_score >= 70
                  ? 'bg-intel-up'
                  : enrichment.digital_presence_score >= 40
                  ? 'bg-pro-gold'
                  : 'bg-intel-down'
              }`}
              style={{ width: `${enrichment.digital_presence_score}%` }}
            />
          </div>
          <p className="text-[10px] text-pro-warm-gray font-sans mt-1.5">
            {enrichment.digital_presence_score >= 70
              ? 'Strong online presence'
              : enrichment.digital_presence_score >= 40
              ? 'Moderate — room to grow'
              : 'Needs attention'}
          </p>
        </div>
      </div>

      {/* Bottom Row: Themes + Social + Website */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Review Themes */}
        <div className="bg-white rounded-xl border border-pro-stone p-5">
          <p className="text-[10px] font-sans font-semibold text-pro-warm-gray uppercase tracking-wider mb-3">
            Top Review Themes
          </p>
          {enrichment.review_themes.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {enrichment.review_themes.map((theme) => (
                <span
                  key={theme}
                  className="text-xs font-sans text-pro-charcoal bg-pro-cream px-2.5 py-1 rounded-full"
                >
                  {theme}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-pro-warm-gray font-sans">No review themes extracted</p>
          )}
          {enrichment.review_concerns.length > 0 && (
            <div className="mt-3 pt-3 border-t border-pro-stone">
              <p className="text-[10px] font-sans font-semibold text-pro-warm-gray uppercase tracking-wider mb-2">
                Areas of Concern
              </p>
              <div className="flex flex-wrap gap-1.5">
                {enrichment.review_concerns.map((concern) => (
                  <span
                    key={concern}
                    className="text-xs font-sans text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full"
                  >
                    {concern}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Social Status */}
        <div className="bg-white rounded-xl border border-pro-stone p-5">
          <p className="text-[10px] font-sans font-semibold text-pro-warm-gray uppercase tracking-wider mb-3">
            Social Presence
          </p>
          <div className="flex items-center gap-2 mb-3">
            {enrichment.social_active ? (
              <>
                <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">
                  <Wifi className="w-3 h-3" />
                  <span className="text-xs font-sans font-semibold">Active</span>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-1.5 bg-pro-cream text-pro-warm-gray px-2.5 py-1 rounded-full">
                <WifiOff className="w-3 h-3" />
                <span className="text-xs font-sans font-semibold">Inactive</span>
              </div>
            )}
          </div>
          {enrichment.social_brand_mentions.length > 0 && (
            <div>
              <p className="text-[10px] font-sans text-pro-warm-gray mb-1.5">Brand mentions:</p>
              <div className="flex flex-wrap gap-1">
                {enrichment.social_brand_mentions.map((brand) => (
                  <span
                    key={brand}
                    className="text-[10px] font-sans text-pro-navy bg-pro-navy/5 px-2 py-0.5 rounded-full"
                  >
                    {brand}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Website Analysis */}
        <div className="bg-white rounded-xl border border-pro-stone p-5">
          <p className="text-[10px] font-sans font-semibold text-pro-warm-gray uppercase tracking-wider mb-3">
            Website Analysis
          </p>
          {enrichment.website_url ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-pro-navy" />
                <span className="text-xs font-sans text-pro-charcoal truncate">
                  {enrichment.website_url.replace(/^https?:\/\//, '')}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-sans font-medium ${enrichment.has_online_booking ? 'text-intel-up' : 'text-pro-warm-gray'}`}>
                  {enrichment.has_online_booking ? 'Online booking enabled' : 'No online booking'}
                </span>
              </div>
              {enrichment.website_mentions_brands.length > 0 && (
                <div className="pt-2 border-t border-pro-stone">
                  <p className="text-[10px] font-sans text-pro-warm-gray mb-1">Brands on site:</p>
                  <p className="text-xs font-sans text-pro-charcoal">
                    {enrichment.website_mentions_brands.join(', ')}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-pro-warm-gray font-sans">No website detected</p>
          )}
        </div>
      </div>

      {/* Service Menu Themes */}
      {enrichment.service_menu_themes.length > 0 && (
        <div className="bg-white rounded-xl border border-pro-stone p-5">
          <p className="text-[10px] font-sans font-semibold text-pro-warm-gray uppercase tracking-wider mb-3">
            Service Menu Themes
          </p>
          <div className="flex flex-wrap gap-1.5">
            {enrichment.service_menu_themes.map((theme) => (
              <span
                key={theme}
                className="text-xs font-sans text-pro-charcoal bg-intel-accent/10 px-2.5 py-1 rounded-full"
              >
                {theme}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SignalCard({ signal }: { signal: IntelligenceSignal }) {
  const directionConfig = {
    up: { icon: TrendingUp, cls: 'text-intel-up', bg: 'bg-intel-up/10' },
    down: { icon: TrendingDown, cls: 'text-intel-down', bg: 'bg-intel-down/10' },
    stable: { icon: Minus, cls: 'text-pro-warm-gray', bg: 'bg-pro-cream' },
  };
  const config = directionConfig[signal.direction];
  const Icon = config.icon;

  return (
    <div className="bg-white rounded-xl border border-pro-stone p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${config.bg}`}>
            <Icon className={`w-3.5 h-3.5 ${config.cls}`} />
          </div>
          <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-pro-warm-gray">
            {signal.signal_type.replace(/_/g, ' ')}
          </span>
        </div>
        <span className={`text-sm font-sans font-semibold ${config.cls}`}>
          {signal.direction === 'up' ? '+' : signal.direction === 'down' ? '-' : ''}{signal.magnitude}%
        </span>
      </div>
      <h4 className="font-sans font-semibold text-pro-charcoal text-sm mb-1">{signal.title}</h4>
      <p className="text-xs text-pro-warm-gray font-sans leading-relaxed line-clamp-3">{signal.description}</p>
      {signal.related_brands && signal.related_brands.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {signal.related_brands.map((brand) => (
            <span key={brand} className="text-[10px] font-sans text-pro-navy bg-pro-navy/5 px-2 py-0.5 rounded-full">{brand}</span>
          ))}
        </div>
      )}
      {signal.category && (
        <span className="inline-block mt-2 text-[10px] font-sans text-pro-warm-gray bg-pro-cream px-2 py-0.5 rounded-full">
          {signal.category}
        </span>
      )}
    </div>
  );
}

// ── Tab 4: Education ───────────────────────────────────────────────

function EducationTab() {
  const content = getRelevantEducation();

  const categoryLabels: Record<string, string> = {
    treatment_protocols: 'Treatment Protocols',
    ingredient_science: 'Ingredient Science',
    business_operations: 'Business Operations',
    compliance_regulatory: 'Compliance & Regulatory',
    device_training: 'Device Training',
    retail_strategy: 'Retail Strategy',
  };

  const typeIcons: Record<string, string> = {
    protocol: 'Protocol',
    article: 'Article',
    video: 'Video',
    webinar: 'Webinar',
    ce_course: 'CE Course',
  };

  return (
    <div className="space-y-6">
      <div className="bg-pro-charcoal rounded-xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <GraduationCap className="w-5 h-5 text-pro-gold" />
          <h3 className="font-sans font-semibold text-white text-base">Recommended for Your Practice</h3>
        </div>
        <p className="text-sm text-pro-stone/80 font-sans">
          Based on your treatment room profile and current market trends, these courses and resources will help you stay ahead.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {content.map((item) => (
          <EducationCard
            key={item.id}
            item={item}
            categoryLabel={categoryLabels[item.category] || item.category}
            typeLabel={typeIcons[item.content_type] || item.content_type}
          />
        ))}
      </div>

      {content.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-10 h-10 mx-auto mb-3 text-pro-stone" />
          <p className="text-sm text-pro-warm-gray font-sans">No personalized recommendations yet.</p>
        </div>
      )}

      <div className="text-center pt-4">
        <Link
          to="/education"
          className="inline-flex items-center gap-2 px-6 py-3 bg-pro-charcoal text-white rounded-lg hover:bg-pro-charcoal/90 transition-colors font-medium font-sans text-sm"
        >
          <BookOpen className="w-4 h-4" />
          Browse All Education
        </Link>
      </div>
    </div>
  );
}

function EducationCard({
  item,
  categoryLabel,
  typeLabel,
}: {
  item: EducationContent;
  categoryLabel: string;
  typeLabel: string;
}) {
  const difficultyColors: Record<string, string> = {
    beginner: 'bg-intel-up/10 text-intel-up',
    intermediate: 'bg-pro-gold/10 text-pro-gold',
    advanced: 'bg-pro-navy/10 text-pro-navy',
  };

  return (
    <div className="bg-white rounded-xl border border-pro-stone p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-pro-warm-gray">
            {categoryLabel}
          </span>
          <span className="text-[10px] font-sans text-pro-stone">|</span>
          <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-pro-warm-gray">
            {typeLabel}
          </span>
        </div>
        <h4 className="font-sans font-semibold text-pro-charcoal text-sm mb-2">{item.title}</h4>
        <p className="text-xs text-pro-warm-gray font-sans leading-relaxed line-clamp-3">{item.summary}</p>
      </div>
      <div className="flex items-center gap-2 mt-4 flex-wrap">
        {item.ce_eligible && item.ce_credits && (
          <span className="text-[10px] font-sans font-semibold text-pro-gold bg-pro-gold/10 px-2.5 py-1 rounded-full">
            {item.ce_credits} CE Credits
          </span>
        )}
        <span className={`text-[10px] font-sans font-semibold px-2.5 py-1 rounded-full ${difficultyColors[item.difficulty] || 'bg-pro-cream text-pro-warm-gray'}`}>
          {item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1)}
        </span>
        {item.duration_minutes && (
          <span className="text-[10px] font-sans text-pro-warm-gray">
            {item.duration_minutes} min
          </span>
        )}
      </div>
    </div>
  );
}
