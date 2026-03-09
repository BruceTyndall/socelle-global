import { useState, useCallback } from 'react';
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
import { SignalDetailPanel } from '../../components/intelligence/SignalDetailPanel';
import type { IntelligenceSignal } from '../../lib/intelligence/types';
import { TierGate, CreditGate } from '../../components/gates';

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

// ── Skeleton ────────────────────────────────────────────────────────

function HubSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-24">
      <div className="animate-pulse space-y-6">
        <div className="h-10 bg-gray-200 rounded-xl w-64" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-xl" />
          ))}
        </div>
        <div className="h-12 bg-gray-200 rounded-xl" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-14 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Error State ─────────────────────────────────────────────────────

function HubError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
      <div className="bg-white rounded-xl border border-[#8E6464]/20 p-12 text-center">
        <AlertTriangle className="w-10 h-10 mx-auto mb-4 text-[#8E6464]" />
        <h2 className="font-sans text-lg font-semibold text-[#141418] mb-2">
          Unable to load intelligence data
        </h2>
        <p className="text-sm font-sans text-gray-500 mb-6">
          There was a problem fetching market signals. Please try again.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#6E879B] text-white text-sm font-sans font-medium hover:bg-[#5A7185] transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────────

export default function IntelligenceHub() {
  const { signals, loading, isLive } = useIntelligence();

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
  if (loading) {
    return (
      <>
        <Helmet>
          <title>Intelligence Hub | Socelle</title>
        </Helmet>
        <HubSkeleton />
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
              loading={loading}
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
  loading,
  onSelectSignal,
}: {
  signals: IntelligenceSignal[];
  loading: boolean;
  onSelectSignal: (signal: IntelligenceSignal) => void;
}) {
  return (
    <>
      <KPIStrip signals={signals} loading={loading} />

      <SignalTable
        signals={signals}
        loading={loading}
        onSelect={onSelectSignal}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <OpportunitySignals signals={signals} loading={loading} />
        <WhatChangedTimeline signals={signals} loading={loading} />
      </div>
    </>
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
