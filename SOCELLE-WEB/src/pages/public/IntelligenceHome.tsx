// ── IntelligenceHome — INTEL-WO-11 ───────────────────────────────────────
// Route: /home — Intelligence-first landing page.
// Distinct from / (PrelaunchQuiz) and /intelligence (full feed).
// Content: KPI strip, featured signals (top 5 by confidence), category nav,
// isLive guard, SEO meta, CTA → "Get Intelligence Access".
// Pearl Mineral V2 tokens only. TanStack Query v5 via useIntelligence().

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import SignalEmptyState from '../../components/intelligence/SignalEmptyState';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  BarChart3,
  Zap,
  ArrowRight,
  ShieldCheck,
  Radio,
} from 'lucide-react';
import MainNav from '../../components/MainNav';
import SiteFooter from '../../components/sections/SiteFooter';
import { useIntelligence } from '../../lib/intelligence/useIntelligence';
import { useDataFeedStats } from '../../lib/intelligence/useDataFeedStats';
import { buildCanonical } from '../../lib/seo';
import type { IntelligenceSignal } from '../../lib/intelligence/types';

// ── Helpers ───────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function getConfidencePct(score: number | undefined): number {
  return score !== undefined ? Math.round(score * 100) : 0;
}

// ── KPI Strip ─────────────────────────────────────────────────────────────

function KPIStrip({
  signals,
  totalSignals,
  enabledFeeds,
  isLive,
}: {
  signals: IntelligenceSignal[];
  totalSignals: number;
  enabledFeeds: number;
  isLive: boolean;
}) {
  const upCount = signals.filter((s) => s.direction === 'up').length;
  const avgConf = useMemo(() => {
    const scored = signals.filter((s) => s.confidence_score !== undefined);
    if (scored.length === 0) return null;
    const sum = scored.reduce((acc, s) => acc + (s.confidence_score ?? 0), 0);
    return Math.round((sum / scored.length) * 100);
  }, [signals]);

  const kpis = [
    {
      label: 'Active Signals',
      value: isLive ? totalSignals.toLocaleString() : '—',
      icon: Activity,
      color: 'text-[#6E879B]',
    },
    {
      label: 'Trending Up',
      value: isLive ? upCount.toString() : '—',
      icon: TrendingUp,
      color: 'text-[#5F8A72]',
    },
    {
      label: 'Data Sources',
      value: isLive ? enabledFeeds.toString() : '—',
      icon: Radio,
      color: 'text-[#6E879B]',
    },
    {
      label: 'Avg Confidence',
      value: avgConf !== null ? `${avgConf}%` : '—',
      icon: ShieldCheck,
      color: avgConf !== null && avgConf >= 70 ? 'text-[#5F8A72]' : 'text-[#A97A4C]',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div key={kpi.label} className="bg-white rounded-xl border border-[#6E879B]/10 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`w-4 h-4 ${kpi.color}`} />
              <p className="text-[10px] font-sans font-semibold text-gray-400 uppercase tracking-wider">
                {kpi.label}
              </p>
            </div>
            <p className={`text-2xl font-sans font-bold ${kpi.color}`}>{kpi.value}</p>
          </div>
        );
      })}
    </div>
  );
}

// ── Featured Signal Card ───────────────────────────────────────────────────

function FeaturedSignalCard({ signal }: { signal: IntelligenceSignal }) {
  const dirConfig = {
    up: { icon: TrendingUp, cls: 'text-[#5F8A72]', bg: 'bg-[#5F8A72]/8', badge: 'bg-[#5F8A72]/10 text-[#5F8A72]' },
    down: { icon: TrendingDown, cls: 'text-[#8E6464]', bg: 'bg-[#8E6464]/8', badge: 'bg-[#8E6464]/10 text-[#8E6464]' },
    stable: { icon: Minus, cls: 'text-gray-400', bg: 'bg-gray-100', badge: 'bg-gray-100 text-gray-500' },
  };
  const cfg = dirConfig[signal.direction];
  const DirIcon = cfg.icon;
  const confidence = getConfidencePct(signal.confidence_score);

  return (
    <div className={`rounded-2xl border border-[#6E879B]/10 p-5 ${cfg.bg}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-sans font-semibold text-gray-400 uppercase tracking-wider mb-1">
            {signal.category ?? signal.signal_type.replace(/_/g, ' ')}
          </p>
          <h3 className="font-sans font-semibold text-[#141418] text-sm leading-snug truncate">
            {signal.title}
          </h3>
        </div>
        <div className="flex-shrink-0 text-right">
          <span className={`text-lg font-sans font-bold ${cfg.cls}`}>
            {signal.direction === 'up' ? '+' : signal.direction === 'down' ? '-' : ''}
            {signal.magnitude}%
          </span>
        </div>
      </div>

      {signal.description && (
        <p className="text-xs font-sans text-gray-600 leading-relaxed mb-3 line-clamp-2">
          {signal.description}
        </p>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <DirIcon className={`w-3.5 h-3.5 flex-shrink-0 ${cfg.cls}`} />
        {confidence > 0 && (
          <span className={`text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}>
            {confidence}% confidence
          </span>
        )}
        <span className="text-[10px] font-sans text-gray-400 ml-auto">
          {timeAgo(signal.updated_at)}
        </span>
      </div>
    </div>
  );
}

// ── Category Navigation ────────────────────────────────────────────────────

function CategoryNav({
  signals,
  activeCategory,
  onSelect,
}: {
  signals: IntelligenceSignal[];
  activeCategory: string;
  onSelect: (cat: string) => void;
}) {
  const categories = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of signals) {
      const cat = s.category ?? 'Other';
      map.set(cat, (map.get(cat) ?? 0) + 1);
    }
    return [
      { name: 'All', count: signals.length },
      ...Array.from(map.entries())
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => ({ name, count })),
    ];
  }, [signals]);

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {categories.map((cat) => (
        <button
          key={cat.name}
          type="button"
          onClick={() => onSelect(cat.name)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-sans font-medium flex-shrink-0 transition-colors ${
            activeCategory === cat.name
              ? 'bg-[#141418] text-white'
              : 'bg-[#F6F3EF] text-[#141418] hover:bg-[#E8EDF1]'
          }`}
        >
          {cat.name}
          <span
            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none ${
              activeCategory === cat.name
                ? 'bg-white/20 text-white'
                : 'bg-[#6E879B]/10 text-[#6E879B]'
            }`}
          >
            {cat.count}
          </span>
        </button>
      ))}
    </div>
  );
}

// ── Demo Banner ───────────────────────────────────────────────────────────

function DemoBanner() {
  return (
    <div className="bg-[#A97A4C]/8 border border-[#A97A4C]/20 rounded-xl px-4 py-3 flex items-center gap-3">
      <Radio className="w-4 h-4 text-[#A97A4C] flex-shrink-0" />
      <p className="text-xs font-sans text-[#A97A4C]">
        <span className="font-semibold">PREVIEW</span> — Signal intelligence is in demo mode.
        Data reflects representative market patterns. Sign in to access live signals.
      </p>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div
      className="space-y-6 animate-pulse"
      aria-busy="true"
      aria-label="Loading intelligence"
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-graphite/6 rounded-xl" />
        ))}
      </div>
      <div className="h-8 bg-graphite/6 rounded-lg w-64" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-40 bg-graphite/6 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function IntelligenceHome() {
  const { signals, isLive, loading, totalSignalCount } = useIntelligence();
  const { enabledFeeds } = useDataFeedStats();
  const [activeCategory, setActiveCategory] = useState('All');

  // Featured: top 5 by confidence (descending), then magnitude
  const featuredSignals = useMemo(() => {
    return [...signals]
      .sort((a, b) => {
        const confA = a.confidence_score ?? 0;
        const confB = b.confidence_score ?? 0;
        if (confA !== confB) return confB - confA;
        return Math.abs(b.magnitude) - Math.abs(a.magnitude);
      })
      .slice(0, 5);
  }, [signals]);

  // Category-filtered view
  const filteredSignals = useMemo(() => {
    if (activeCategory === 'All') return featuredSignals;
    return signals
      .filter((s) => (s.category ?? 'Other') === activeCategory)
      .sort((a, b) => (b.confidence_score ?? 0) - (a.confidence_score ?? 0))
      .slice(0, 6);
  }, [activeCategory, featuredSignals, signals]);

  return (
    <>
      <Helmet>
        <title>Intelligence Home — SOCELLE</title>
        <meta
          name="description"
          content="Live market intelligence for professional beauty and medspa operators. Track treatment trends, pricing shifts, and ingredient momentum."
        />
        <link rel="canonical" href={buildCanonical('/home')} />
        <meta property="og:title" content="Intelligence Home — SOCELLE" />
        <meta
          property="og:description"
          content="Professional beauty market intelligence. Live signals. Verified confidence scores."
        />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <MainNav />

      <main className="min-h-screen bg-[#F6F3EF] pt-20 pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Hero */}
          <div className="py-10 sm:py-14">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-[#6E879B]" />
              <span className="text-xs font-sans font-semibold text-[#6E879B] uppercase tracking-wider">
                Intelligence Platform
              </span>
              {isLive && (
                <span className="flex items-center gap-1 text-[10px] font-semibold bg-[#5F8A72]/10 text-[#5F8A72] px-2 py-0.5 rounded-full ml-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#5F8A72] animate-pulse" />
                  LIVE
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-sans font-bold text-[#141418] leading-tight mb-4">
              Market Intelligence for<br />
              <span className="text-[#6E879B]">Professional Beauty</span>
            </h1>
            <p className="text-base font-sans text-gray-600 max-w-xl leading-relaxed mb-6">
              Track treatment demand, ingredient momentum, pricing shifts, and regulatory changes —
              before they impact your business.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to="/request-access"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#141418] text-white font-sans font-medium text-sm hover:bg-[#2A2A30] transition-colors"
              >
                <Zap className="w-4 h-4" />
                Get Intelligence Access
              </Link>
              <Link
                to="/intelligence"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#6E879B]/20 bg-white text-[#141418] font-sans font-medium text-sm hover:bg-[#E8EDF1] transition-colors"
              >
                View full feed
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Loading skeleton */}
          {loading && <PageSkeleton />}

          {!loading && (
            <div className="space-y-8">
              {/* DEMO banner */}
              {!isLive && <DemoBanner />}

              {/* KPI Strip */}
              <KPIStrip
                signals={signals}
                totalSignals={totalSignalCount}
                enabledFeeds={enabledFeeds}
                isLive={isLive}
              />

              {/* Category nav */}
              {signals.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-sans font-semibold text-[#141418] text-lg">
                      {activeCategory === 'All' ? 'Featured Signals' : activeCategory}
                    </h2>
                    <Link
                      to="/intelligence"
                      className="text-xs font-sans font-medium text-[#6E879B] hover:text-[#5A7185] transition-colors flex items-center gap-1"
                    >
                      All signals
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                  <CategoryNav
                    signals={signals}
                    activeCategory={activeCategory}
                    onSelect={setActiveCategory}
                  />
                </div>
              )}

              {/* Signal cards grid */}
              {filteredSignals.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredSignals.map((signal) => (
                    <FeaturedSignalCard key={signal.id} signal={signal} />
                  ))}
                </div>
              )}

              {/* Empty state (no signals in DB yet) */}
              {signals.length === 0 && (
                <SignalEmptyState variant="no-signals" />
              )}

              {/* Bottom CTA */}
              <div className="bg-[#141418] rounded-2xl p-8 text-center">
                <BarChart3 className="w-8 h-8 text-[#6E879B] mx-auto mb-4" />
                <h2 className="font-sans font-bold text-white text-xl mb-3">
                  Intelligence-driven operations
                </h2>
                <p className="text-sm font-sans text-white/60 max-w-md mx-auto mb-6 leading-relaxed">
                  Professional beauty operators using SOCELLE intelligence report faster service
                  menu decisions and more informed procurement choices.
                </p>
                <Link
                  to="/request-access"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#6E879B] text-white font-sans font-medium text-sm hover:bg-[#5A7185] transition-colors"
                >
                  <Zap className="w-4 h-4" />
                  Get Intelligence Access
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
