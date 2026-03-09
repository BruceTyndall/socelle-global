// ── KPIStrip — V2-INTEL-01 (Module 1/10) ─────────────────────────────
// 6 KPI cards: total signals, trending up, new this week, categories,
// avg confidence, data sources. Skeleton shimmer when loading.
// Pearl Mineral V2 tokens only. Pure props, no fetching.

import { useMemo } from 'react';
import {
  Activity,
  TrendingUp,
  Calendar,
  Layers,
  ShieldCheck,
  Rss,
} from 'lucide-react';
import type { IntelligenceSignal } from '../../../lib/intelligence/types';

// ── Types ────────────────────────────────────────────────────────────

export interface KPIStripProps {
  signals: IntelligenceSignal[];
  loading?: boolean;
}

interface KPICard {
  label: string;
  value: string;
  icon: typeof Activity;
  color: string;
  bg: string;
}

// ── Component ────────────────────────────────────────────────────────

export function KPIStrip({ signals, loading = false }: KPIStripProps) {
  const kpis = useMemo((): KPICard[] => {
    const total = signals.length;
    const trendingUp = signals.filter((s) => s.direction === 'up').length;

    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const newThisWeek = signals.filter(
      (s) => new Date(s.updated_at).getTime() > oneWeekAgo,
    ).length;

    const categories = new Set<string>();
    signals.forEach((s) => {
      if (s.category) categories.add(s.category);
    });

    const scored = signals.filter(
      (s) => s.confidence_score !== undefined && s.confidence_score !== null,
    );
    const avgConfidence =
      scored.length > 0
        ? Math.round(
            (scored.reduce((sum, s) => sum + (s.confidence_score ?? 0), 0) /
              scored.length) *
              100,
          )
        : 0;

    const sources = new Set<string>();
    signals.forEach((s) => {
      if (s.source_name) sources.add(s.source_name);
      else if (s.source) sources.add(s.source);
    });

    return [
      {
        label: 'Total Signals',
        value: total.toLocaleString(),
        icon: Activity,
        color: 'text-[#6E879B]',
        bg: 'bg-[#E8EDF1]',
      },
      {
        label: 'Trending Up',
        value: trendingUp.toLocaleString(),
        icon: TrendingUp,
        color: 'text-[#5F8A72]',
        bg: 'bg-[#5F8A72]/10',
      },
      {
        label: 'New This Week',
        value: newThisWeek.toLocaleString(),
        icon: Calendar,
        color: 'text-[#6E879B]',
        bg: 'bg-[#E8EDF1]',
      },
      {
        label: 'Categories',
        value: categories.size.toLocaleString(),
        icon: Layers,
        color: 'text-[#6E879B]',
        bg: 'bg-[#E8EDF1]',
      },
      {
        label: 'Avg Confidence',
        value: avgConfidence > 0 ? `${avgConfidence}%` : '\u2014',
        icon: ShieldCheck,
        color: 'text-[#A97A4C]',
        bg: 'bg-[#A97A4C]/10',
      },
      {
        label: 'Data Sources',
        value: sources.size.toLocaleString(),
        icon: Rss,
        color: 'text-[#6E879B]',
        bg: 'bg-[#E8EDF1]',
      },
    ];
  }, [signals]);

  // ── Skeleton shimmer ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse bg-white rounded-xl border border-[#6E879B]/10 p-4 space-y-3"
          >
            <div className="w-8 h-8 bg-gray-200 rounded-lg" />
            <div className="h-6 bg-gray-200 rounded w-16" />
            <div className="h-3 bg-gray-100 rounded w-20" />
          </div>
        ))}
      </div>
    );
  }

  // ── Empty state ──────────────────────────────────────────────────
  if (signals.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-[#6E879B]/10 p-8 text-center">
        <Activity className="w-8 h-8 mx-auto mb-2 text-gray-300" />
        <p className="text-sm font-sans text-gray-500">No signal data available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div
            key={kpi.label}
            className="bg-white rounded-xl border border-[#6E879B]/10 p-4 flex flex-col gap-2"
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${kpi.bg}`}>
              <Icon className={`w-4 h-4 ${kpi.color}`} />
            </div>
            <div>
              <p className="text-xl font-sans font-bold text-[#141418]">{kpi.value}</p>
              <p className="text-[10px] font-sans font-medium text-gray-400 uppercase tracking-wider">
                {kpi.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
