import { useState, useCallback, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Brain,
  AlertTriangle,
  ChevronRight,
  BarChart3,
  TrendingUp,
  Layers,
  Swords,
  MapPin,
  ShieldCheck,
  Search,
  MessageSquare,
  FileText,
  ClipboardList,
  FlaskConical,
  Scale,
  X,
} from 'lucide-react';
import { useIntelligence } from '../../lib/intelligence/useIntelligence';
import { normalizeMediaUrl } from '../../lib/intelligence/normalizeMediaUrl';
import { SignalDetailPanel } from '../../components/intelligence/SignalDetailPanel';
import type { IntelligenceSignal } from '../../lib/intelligence/types';
import { TierGate, CreditGate } from '../../components/gates';
import ApiStatusRibbon from '../../components/intelligence/ApiStatusRibbon';
import IntelligenceDashboardSkeleton from '../../components/intelligence/IntelligenceDashboardSkeleton';
import SignalErrorState from '../../components/intelligence/SignalErrorState';
import { useTier } from '../../hooks/useTier';

// ── Cloud Modules (10) ──────────────────────────────────────────────
import {
  KPIStrip,
  SignalTable,
  TrendStacks,
  WhatChangedTimeline,
  OpportunitySignals,
  ConfidenceProvenance,
  CategoryIntelligence,
  CompetitiveBenchmarking,
  BrandHealthMonitor,
  LocalMarketView,
} from '../../components/intelligence/cloud';

// ── AI Tools (6) ────────────────────────────────────────────────────
import {
  ExplainSignal,
  SignalSearch,
  BriefGenerator,
  ActionPlanGenerator,
  RnDScout,
  MoCRAChecker,
} from '../../components/intelligence/tools';

// ── Tab config ──────────────────────────────────────────────────────

type TabKey = 'overview' | 'trends' | 'categories' | 'competitive' | 'local' | 'provenance';

interface TabDef {
  key: TabKey;
  label: string;
  icon: typeof BarChart3;
}

const TABS: TabDef[] = [
  { key: 'overview', label: 'Overview', icon: BarChart3 },
  { key: 'trends', label: 'Trends', icon: TrendingUp },
  { key: 'categories', label: 'Categories', icon: Layers },
  { key: 'competitive', label: 'Competitive', icon: Swords },
  { key: 'local', label: 'Local', icon: MapPin },
  { key: 'provenance', label: 'Provenance', icon: ShieldCheck },
];

// ── AI Tool config ──────────────────────────────────────────────────

type AIToolKey = 'explain' | 'search' | 'brief' | 'plan' | 'rnd' | 'mocra';

interface AIToolDef {
  key: AIToolKey;
  label: string;
  icon: typeof Search;
}

const AI_TOOL_DEFS: AIToolDef[] = [
  { key: 'search', label: 'Search', icon: Search },
  { key: 'explain', label: 'Explain', icon: MessageSquare },
  { key: 'brief', label: 'Brief', icon: FileText },
  { key: 'plan', label: 'Plan', icon: ClipboardList },
  { key: 'rnd', label: 'R&D Scout', icon: FlaskConical },
  { key: 'mocra', label: 'MoCRA', icon: Scale },
];

// ── Skeleton (uses shared IntelligenceDashboardSkeleton) ────────────

// ── Error State (uses shared SignalErrorState) ──────────────────────

// ── Main Component ──────────────────────────────────────────────────

export default function IntelligenceHub() {
  const { tier, isLoading: tierLoading } = useTier();
  const signalLimit = tier === 'free' ? 80 : 140;
  const { signals, loading, isLive } = useIntelligence({ limit: signalLimit });
  const { signals: timelineSignals, loading: timelineLoading } = useIntelligence({
    limit: 15,
    timeline: true,
  });

  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [selectedSignal, setSelectedSignal] = useState<IntelligenceSignal | null>(null);
  const [activeAITool, setActiveAITool] = useState<AIToolKey | null>(null);

  const handleSelectSignal = useCallback((signal: IntelligenceSignal) => {
    setSelectedSignal(signal);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedSignal(null);
  }, []);

  const handleCloseAITool = useCallback(() => {
    setActiveAITool(null);
  }, []);

  // ── Loading state ───────────────────────────────────────────────
  if (loading || tierLoading) {
    return (
      <>
        <Helmet>
          <title>Intelligence Hub | Socelle</title>
        </Helmet>
        <IntelligenceDashboardSkeleton />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Intelligence Hub | Socelle</title>
        <meta
          name="description"
          content="Professional beauty and medspa market intelligence. Live signals, trends, and market signal analysis."
        />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {/* ── Page Header ──────────────────────────────────────── */}
        <div className="mb-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs font-sans text-gray-400 mb-3">
            <span>Portal</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#141418] font-medium">Intelligence Hub</span>
          </nav>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#141418] flex items-center justify-center">
              <Brain className="w-5 h-5 text-[#6E879B]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-sans text-2xl font-bold text-[#141418]">Intelligence Hub</h1>
                {!isLive && (
                  <span className="text-[10px] font-semibold bg-[#A97A4C]/10 text-[#A97A4C] px-2 py-0.5 rounded-full">
                    DEMO
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 font-sans">
                Market signals, trends, and intelligence analysis
              </p>
            </div>
          </div>
        </div>

        {/* ── DEMO Banner ──────────────────────────────────────── */}
        {!isLive && (
          <div className="flex items-center gap-2 px-4 py-2.5 mb-6 bg-[#A97A4C]/10 rounded-lg border border-[#A97A4C]/20">
            <AlertTriangle className="w-4 h-4 text-[#A97A4C] flex-shrink-0" />
            <p className="text-xs font-sans text-[#A97A4C]">
              <span className="font-semibold">DEMO</span> — Showing sample signals.
              Live data activates when market_signals table is populated.
            </p>
          </div>
        )}

        {/* ── Sticky Tab Bar ───────────────────────────────────── */}
        <div className="sticky top-0 z-20 bg-[#F6F3EF] -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 py-3 mb-6 border-b border-[#6E879B]/10">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-sans font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-[#141418] text-white'
                      : 'text-gray-500 hover:bg-[#E8EDF1] hover:text-[#141418]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Tab Content ──────────────────────────────────────── */}
        <div className="space-y-8">
          {activeTab === 'overview' && (
            <OverviewTab
              signals={signals}
              timelineSignals={timelineSignals}
              loading={loading}
              timelineLoading={timelineLoading}
              onSelectSignal={handleSelectSignal}
            />
          )}

          {activeTab === 'trends' && (
            <TrendsTab signals={signals} loading={loading} />
          )}

          {activeTab === 'categories' && (
            <TierGate requiredTier="starter" contextMessage="Category Intelligence requires a Starter plan or above.">
              <CategoryIntelligence
                signals={signals}
                loading={loading}
                onSelectSignal={handleSelectSignal}
              />
            </TierGate>
          )}

          {activeTab === 'competitive' && (
            <TierGate requiredTier="starter" contextMessage="Competitive Benchmarking requires a Starter plan or above.">
              <CompetitiveTab signals={signals} loading={loading} />
            </TierGate>
          )}

          {activeTab === 'local' && (
            <TierGate requiredTier="pro" contextMessage="Local Market View requires a Pro plan or above.">
              <LocalMarketView
                signals={signals}
                loading={loading}
                onSelectSignal={handleSelectSignal}
              />
            </TierGate>
          )}

          {activeTab === 'provenance' && (
            <TierGate requiredTier="starter" contextMessage="Confidence and Provenance data requires a Starter plan or above.">
              <ConfidenceProvenance signal={selectedSignal} loading={loading} />
            </TierGate>
          )}
        </div>
      </div>

      {/* ── AI Toolbar (fixed bottom) ──────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#141418] border-t border-[#6E879B]/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2 py-3">
            {AI_TOOL_DEFS.map((tool) => {
              const Icon = tool.icon;
              const isActive = activeAITool === tool.key;
              return (
                <button
                  key={tool.key}
                  type="button"
                  onClick={() => setActiveAITool(isActive ? null : tool.key)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-sans font-medium transition-colors ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tool.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── AI Tool Modals (tier + credit gated) ────────────────── */}
      {activeAITool === 'explain' && (
        <TierGate requiredTier="starter" contextMessage="Explain Signal requires a Starter plan or above.">
          <CreditGate cost={5}>
            <ExplainSignal
              signalId={selectedSignal?.id ?? ''}
              signalTitle={selectedSignal?.title}
              onClose={handleCloseAITool}
            />
          </CreditGate>
        </TierGate>
      )}
      {activeAITool === 'search' && (
        <TierGate requiredTier="starter" contextMessage="Signal Search requires a Starter plan or above.">
          <CreditGate cost={2}>
            <SignalSearch onClose={handleCloseAITool} />
          </CreditGate>
        </TierGate>
      )}
      {activeAITool === 'brief' && (
        <TierGate requiredTier="pro" contextMessage="Brief Generator requires a Pro plan or above.">
          <CreditGate cost={25}>
            <BriefGenerator onClose={handleCloseAITool} />
          </CreditGate>
        </TierGate>
      )}
      {activeAITool === 'plan' && (
        <TierGate requiredTier="pro" contextMessage="Action Plan Generator requires a Pro plan or above.">
          <CreditGate cost={30}>
            <ActionPlanGenerator onClose={handleCloseAITool} />
          </CreditGate>
        </TierGate>
      )}
      {activeAITool === 'rnd' && (
        <TierGate requiredTier="pro" contextMessage="R&D Scout requires a Pro plan or above.">
          <CreditGate cost={40}>
            <RnDScout onClose={handleCloseAITool} />
          </CreditGate>
        </TierGate>
      )}
      {activeAITool === 'mocra' && (
        <TierGate requiredTier="pro" contextMessage="MoCRA Checker requires a Pro plan or above.">
          <CreditGate cost={20}>
            <MoCRAChecker onClose={handleCloseAITool} />
          </CreditGate>
        </TierGate>
      )}

      {/* ── Signal Detail Slide-out ────────────────────────────── */}
      {selectedSignal && !activeAITool && (
        <SignalDetailPanel
          signal={selectedSignal}
          onClose={handleCloseDetail}
        />
      )}
    </>
  );
}

// ── Overview Tab ────────────────────────────────────────────────────

function OverviewTab({
  signals,
  timelineSignals,
  loading,
  timelineLoading,
  onSelectSignal,
}: {
  signals: IntelligenceSignal[];
  timelineSignals: IntelligenceSignal[];
  loading: boolean;
  timelineLoading: boolean;
  onSelectSignal: (signal: IntelligenceSignal) => void;
}) {
  const featuredSignals = useMemo(() => {
    const hasMedia = (signal: IntelligenceSignal) =>
      Boolean(
        normalizeMediaUrl(signal.hero_image_url)
        ?? normalizeMediaUrl(signal.image_urls?.[0])
        ?? normalizeMediaUrl(signal.image_url)
      );

    const hasReadableState = (signal: IntelligenceSignal) =>
      Boolean(signal.article_body || signal.article_html || signal.source_url || signal.description);

    const picked: IntelligenceSignal[] = [];
    const seen = new Set<string>();

    const tryAdd = (signal: IntelligenceSignal) => {
      if (!signal || seen.has(signal.id)) return;
      seen.add(signal.id);
      picked.push(signal);
    };

    signals
      .filter((signal) => hasMedia(signal) && hasReadableState(signal))
      .slice(0, 4)
      .forEach(tryAdd);

    signals
      .filter((signal) => (signal.impact_score ?? 0) >= 60 || signal.signal_type === 'regulatory_alert')
      .slice(0, 4)
      .forEach(tryAdd);

    signals
      .filter(hasReadableState)
      .slice(0, 4)
      .forEach(tryAdd);

    return picked.slice(0, 4);
  }, [signals]);

  const merchandisedTimeline = timelineSignals.length > 0 ? timelineSignals : signals;

  return (
    <>
      {/* Data source status — detailed cards for portal users */}
      <div className="mb-6">
        <ApiStatusRibbon showDetailed={true} />
      </div>

      <FeaturedCoverageDeck
        signals={featuredSignals}
        onSelectSignal={onSelectSignal}
      />

      <KPIStrip signals={signals} loading={loading} />

      <SignalTable
        signals={signals}
        loading={loading}
        onSelect={onSelectSignal}
        defaultSortField="impact_score"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <OpportunitySignals signals={signals} loading={loading} />
        <WhatChangedTimeline signals={merchandisedTimeline} loading={timelineLoading} />
      </div>
    </>
  );
}

function FeaturedCoverageDeck({
  signals,
  onSelectSignal,
}: {
  signals: IntelligenceSignal[];
  onSelectSignal: (signal: IntelligenceSignal) => void;
}) {
  if (signals.length === 0) return null;

  const lead = signals[0];
  const supporting = signals.slice(1, 4);

  return (
    <section className="mb-8">
      <div className="flex items-end justify-between gap-3 mb-4">
        <div>
          <p className="text-[11px] font-sans font-semibold uppercase tracking-[0.18em] text-[#6E879B]">
            Featured Coverage
          </p>
          <h2 className="font-sans text-lg font-semibold text-[#141418]">
            Live signal cards with source media
          </h2>
        </div>
        <p className="text-xs font-sans text-gray-500 max-w-sm text-right">
          Ranked from live feeds and biased toward readable content with real source images when available.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] gap-5">
        <StorySignalCard
          signal={lead}
          onSelect={onSelectSignal}
          featured={true}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-1 gap-5">
          {supporting.map((signal) => (
            <StorySignalCard
              key={signal.id}
              signal={signal}
              onSelect={onSelectSignal}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function StorySignalCard({
  signal,
  onSelect,
  featured = false,
}: {
  signal: IntelligenceSignal;
  onSelect: (signal: IntelligenceSignal) => void;
  featured?: boolean;
}) {
  const mediaUrl = normalizeMediaUrl(signal.hero_image_url)
    ?? normalizeMediaUrl(signal.image_urls?.[0])
    ?? normalizeMediaUrl(signal.image_url);

  const sourceLabel = signal.source_name ?? signal.source ?? 'Market signal';
  const segmentLabel = signal.content_segment?.replace(/_/g, ' ');
  const recency = signal.published_at ?? signal.updated_at;

  return (
    <button
      type="button"
      onClick={() => onSelect(signal)}
      className={`group overflow-hidden rounded-2xl border border-[#6E879B]/10 bg-white text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#6E879B]/25 hover:shadow-md ${
        featured ? 'h-full' : ''
      }`}
    >
      {mediaUrl ? (
        <div className={featured ? 'aspect-[16/9] overflow-hidden' : 'aspect-[16/10] overflow-hidden'}>
          <img
            src={mediaUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            loading="lazy"
            onError={(event) => {
              (event.target as HTMLImageElement).parentElement?.remove();
            }}
          />
        </div>
      ) : (
        <div className={featured ? 'aspect-[16/9] bg-gradient-to-br from-[#E8EDF1] via-white to-[#F6F3EF]' : 'aspect-[16/10] bg-gradient-to-br from-[#F6F3EF] via-white to-[#E8EDF1]'}>
          <div className="flex h-full items-end p-5">
            <div className="rounded-full bg-[#141418]/5 px-3 py-1 text-[10px] font-sans font-semibold uppercase tracking-[0.16em] text-[#141418]/55">
              Live Source Media Unavailable
            </div>
          </div>
        </div>
      )}

      <div className={featured ? 'p-5 md:p-6' : 'p-4'}>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#E8EDF1] px-2.5 py-1 text-[10px] font-sans font-semibold uppercase tracking-[0.14em] text-[#6E879B]">
            {signal.signal_type.replace(/_/g, ' ')}
          </span>
          {segmentLabel && (
            <span className="rounded-full bg-[#141418]/5 px-2.5 py-1 text-[10px] font-sans font-medium capitalize text-[#141418]/70">
              {segmentLabel}
            </span>
          )}
          {signal.quality_score != null && signal.quality_score > 70 && (
            <span className="rounded-full bg-[#5F8A72]/10 px-2.5 py-1 text-[10px] font-sans font-semibold uppercase tracking-[0.14em] text-[#5F8A72]">
              Premium
            </span>
          )}
        </div>

        <h3 className={`font-sans font-semibold leading-tight text-[#141418] transition-colors group-hover:text-[#2A2A33] ${
          featured ? 'text-xl md:text-2xl mb-3' : 'text-base mb-2'
        }`}>
          {signal.title}
        </h3>

        {signal.description && (
          <p className={`font-sans text-gray-600 ${
            featured ? 'line-clamp-3 text-sm leading-6 mb-4' : 'line-clamp-2 text-sm leading-5 mb-3'
          }`}>
            {signal.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-sans text-gray-500">
          <span className="font-medium text-[#141418]/70">{sourceLabel}</span>
          {signal.reading_time_minutes != null && signal.reading_time_minutes > 0 && (
            <span>{signal.reading_time_minutes} min read</span>
          )}
          {signal.impact_score != null && (
            <span>Impact {signal.impact_score}</span>
          )}
          <span>{new Date(recency).toLocaleDateString()}</span>
        </div>
      </div>
    </button>
  );
}

// ── Trends Tab ──────────────────────────────────────────────────────

function TrendsTab({
  signals,
  loading,
}: {
  signals: IntelligenceSignal[];
  loading: boolean;
}) {
  return (
    <>
      <TrendStacks signals={signals} loading={loading} />
      <WhatChangedTimeline signals={signals} loading={loading} />
    </>
  );
}

// ── Competitive Tab ─────────────────────────────────────────────────

function CompetitiveTab({
  signals,
  loading,
}: {
  signals: IntelligenceSignal[];
  loading: boolean;
}) {
  return (
    <>
      <CompetitiveBenchmarking signals={signals} loading={loading} />
      <BrandHealthMonitor signals={signals} loading={loading} />
    </>
  );
}
