import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { TrendingUp, Zap } from 'lucide-react';

interface SignalPulse {
  total: number;
  thisWeek: number;
  todaySources: number;
  vertical_counts: Record<string, number>;
  top_topics: Array<{ topic: string; count: number }>;
  trending: Array<{ id: string; title: string; impact_score: number | null; vertical: string | null }>;
}

async function fetchSignalPulse(): Promise<SignalPulse> {
  const weekAgo = new Date(Date.now() - 7 * 24 * 3_600_000).toISOString();
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();

  const [totalRes, weekRes, todaySourcesRes, verticalRes, topicRes, trendingRes] =
    await Promise.all([
      supabase.from('market_signals').select('id', { count: 'exact', head: true }).eq('active', true),
      supabase
        .from('market_signals')
        .select('id', { count: 'exact', head: true })
        .eq('active', true)
        .gte('created_at', weekAgo),
      supabase
        .from('story_drafts')
        .select('source_feed_id', { count: 'exact', head: true })
        .eq('status', 'published')
        .gte('created_at', todayStart),
      supabase
        .from('market_signals')
        .select('vertical')
        .eq('active', true)
        .not('vertical', 'is', null),
      supabase
        .from('market_signals')
        .select('topic')
        .eq('active', true)
        .not('topic', 'is', null),
      supabase
        .from('market_signals')
        .select('id, title, impact_score, vertical')
        .eq('active', true)
        .order('impact_score', { ascending: false })
        .limit(3),
    ]);

  // Aggregate vertical counts
  const vertical_counts: Record<string, number> = {};
  for (const row of verticalRes.data ?? []) {
    if (row.vertical) {
      vertical_counts[row.vertical] = (vertical_counts[row.vertical] ?? 0) + 1;
    }
  }

  // Aggregate top topics
  const topicMap: Record<string, number> = {};
  for (const row of topicRes.data ?? []) {
    if (row.topic) {
      topicMap[row.topic] = (topicMap[row.topic] ?? 0) + 1;
    }
  }
  const top_topics = Object.entries(topicMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([topic, count]) => ({ topic, count }));

  return {
    total: totalRes.count ?? 0,
    thisWeek: weekRes.count ?? 0,
    todaySources: todaySourcesRes.count ?? 0,
    vertical_counts,
    top_topics,
    trending: (trendingRes.data ?? []).map((row) => ({
      id: row.id,
      title: row.title,
      impact_score: row.impact_score,
      vertical: row.vertical,
    })),
  };
}

function humanizeVertical(value?: string | null): string {
  if (!value) return 'Other';
  const map: Record<string, string> = {
    medspa: 'Medspa',
    salon: 'Salon',
    beauty_brand: 'Brand',
  };
  return map[value] ?? value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function humanizeTopic(value: string): string {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

const VERTICAL_COLORS: Record<string, string> = {
  medspa: 'bg-[#6E879B]',
  salon: 'bg-[#5F8A72]',
  beauty_brand: 'bg-[#A97A4C]',
};

function StatCell({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-[#F8F9FB] border border-[#e2e6ea] p-3 text-center">
      <p className="text-[11px] uppercase tracking-[0.14em] text-[#717182] mb-1">{label}</p>
      <p className="font-mono text-xl font-medium text-[#1a1a1a]">{value}</p>
    </div>
  );
}

export default function IntelligenceInsightsPanel() {
  const { data, isLoading, isError, refetch } = useQuery<SignalPulse>({
    queryKey: ['intelligence-insights-panel'],
    queryFn: fetchSignalPulse,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <aside className="bg-white rounded-xl border border-[#e2e6ea] p-5 sticky top-6 animate-pulse space-y-4">
        <div className="h-4 w-28 rounded bg-[#e2e6ea]" />
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-16 rounded-lg bg-[#F8F9FB]" />
          ))}
        </div>
        <div className="h-3 w-full rounded bg-[#e2e6ea]" />
        <div className="space-y-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-8 rounded bg-[#F8F9FB]" />
          ))}
        </div>
      </aside>
    );
  }

  if (isError || !data) {
    return (
      <aside className="bg-white rounded-xl border border-[#e2e6ea] p-5 sticky top-6">
        <p className="text-sm text-[#717182] mb-3">Could not load market pulse.</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="text-sm text-[#6E879B] underline underline-offset-2"
        >
          Retry
        </button>
      </aside>
    );
  }

  const totalVerticals = Object.values(data.vertical_counts).reduce((a, b) => a + b, 0) || 1;

  return (
    <aside className="bg-white rounded-xl border border-[#e2e6ea] p-5 sticky top-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#5F8A72] animate-pulse" />
          <p className="text-[11px] uppercase tracking-[0.16em] text-[#717182] font-medium">
            Market Pulse
          </p>
        </div>
        <TrendingUp className="h-4 w-4 text-[#aeaeba]" />
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-3 gap-2">
        <StatCell label="Signals" value={data.total} />
        <StatCell label="This Week" value={data.thisWeek} />
        <StatCell label="New Today" value={data.todaySources} />
      </div>

      {/* Vertical breakdown */}
      {Object.keys(data.vertical_counts).length > 0 && (
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-[#717182] mb-2">
            Channel Breakdown
          </p>
          <div className="space-y-2">
            {Object.entries(data.vertical_counts)
              .sort((a, b) => b[1] - a[1])
              .map(([key, count]) => {
                const pct = Math.round((count / totalVerticals) * 100);
                const colorClass = VERTICAL_COLORS[key] ?? 'bg-[#c8cfd6]';
                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] text-[#1a1a1a]">{humanizeVertical(key)}</span>
                      <span className="text-[11px] font-mono text-[#717182]">{pct}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-[#ececf0]">
                      <div
                        className={`h-1.5 rounded-full ${colorClass}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Top topics */}
      {data.top_topics.length > 0 && (
        <div>
          <p className="text-[11px] uppercase tracking-[0.16em] text-[#717182] mb-2">
            Top Topics
          </p>
          <ol className="space-y-1.5">
            {data.top_topics.map((item, index) => (
              <li key={item.topic} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-[#aeaeba] w-4 text-right">
                    {index + 1}
                  </span>
                  <span className="text-[13px] text-[#1a1a1a]">{humanizeTopic(item.topic)}</span>
                </div>
                <span className="rounded-full bg-[#F8F9FB] border border-[#e2e6ea] px-2 py-0.5 text-[11px] font-mono text-[#717182]">
                  {item.count}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Trending now */}
      {data.trending.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Zap className="h-3.5 w-3.5 text-[#A97A4C]" />
            <p className="text-[11px] uppercase tracking-[0.16em] text-[#717182]">Trending Now</p>
          </div>
          <div className="space-y-2">
            {data.trending.map((signal) => (
              <div
                key={signal.id}
                className="rounded-lg border border-[#e2e6ea] bg-[#F8F9FB] px-3 py-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[13px] leading-snug text-[#1a1a1a] line-clamp-2 flex-1">
                    {signal.title}
                  </p>
                  {signal.impact_score !== null && signal.impact_score !== undefined && (
                    <span className="shrink-0 rounded-full border border-[#5F8A72]/20 bg-[#5F8A72]/8 px-2 py-0.5 text-[11px] font-mono text-[#5F8A72]">
                      {signal.impact_score}
                    </span>
                  )}
                </div>
                {signal.vertical && (
                  <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-[#aeaeba]">
                    {humanizeVertical(signal.vertical)}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
