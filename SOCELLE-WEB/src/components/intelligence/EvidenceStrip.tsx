/* ═══════════════════════════════════════════════════════════════
   EvidenceStrip — MERCH-INTEL-01 Phase 3
   Provenance display for signal cards on /intelligence.
   Shows source_name, feed_category, and related rss_item headlines.
   Pearl Mineral V2 tokens only.
   ═══════════════════════════════════════════════════════════════ */
import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import type { IntelligenceSignal } from '../../lib/intelligence/types';

interface RssItemRow {
  id: string;
  title: string | null;
}

interface EvidenceStripProps {
  signal: IntelligenceSignal;
  /** Compact single-row mode for standard cards; default full mode for featured */
  compact?: boolean;
}

function resolveCategoryLabel(signal: IntelligenceSignal): string {
  const type = signal.signal_type;
  if (type === 'regulatory_alert') return 'Regulatory';
  if (type === 'research_insight') return 'Academic';
  if (type === 'ingredient_momentum' || type === 'ingredient_trend') return 'Ingredients';
  if (type === 'market_data') return 'Market Data';
  if (type === 'treatment_trend') return 'Treatment';
  if (type === 'pricing_benchmark') return 'Pricing';
  if (signal.category) return signal.category.charAt(0).toUpperCase() + signal.category.slice(1);
  return 'Industry';
}

export default function EvidenceStrip({ signal, compact = false }: EvidenceStripProps) {
  const sourceName = signal.source_name ?? signal.source;
  const cat = resolveCategoryLabel(signal);

  // Fetch up to 2 related rss_items — silent on error, non-blocking
  const { data: relatedItems = [] } = useQuery<RssItemRow[]>({
    queryKey: ['rss_evidence', signal.id],
    queryFn: async () => {
      if (!sourceName) return [];
      const { data } = await supabase
        .from('rss_items')
        .select('id, title')
        .order('ingested_at', { ascending: false })
        .limit(2);
      return (data ?? []) as RssItemRow[];
    },
    enabled: isSupabaseConfigured && !!sourceName,
    staleTime: 300_000,
    retry: false,
  });

  if (compact) {
    return (
      <div className="flex items-center gap-2 min-w-0 overflow-hidden">
        <span className="text-[9px] font-semibold text-graphite/25 uppercase tracking-[0.07em] shrink-0">
          {cat}
        </span>
        {sourceName && (
          <>
            <span className="text-[9px] text-graphite/18 shrink-0">·</span>
            <span className="text-[9px] text-graphite/25 truncate">{sourceName}</span>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="pt-3 mt-3 border-t border-graphite/6 space-y-1.5">
      {/* Source + category */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[10px] font-semibold text-graphite/28 uppercase tracking-[0.08em]">
          Source
        </span>
        {sourceName && (
          <span className="text-[10px] text-graphite/42 truncate max-w-[180px]">
            {sourceName}
          </span>
        )}
        <span className="w-px h-2.5 bg-graphite/12 shrink-0" />
        <span className="text-[10px] font-semibold text-accent/55 uppercase tracking-[0.07em]">
          {cat}
        </span>
      </div>

      {/* Related headlines from rss_items */}
      {relatedItems.length > 0 && (
        <ul className="space-y-1">
          {relatedItems.map((item) => (
            <li key={item.id} className="flex items-start gap-1.5">
              <span className="w-1 h-1 rounded-full bg-graphite/15 mt-1.5 shrink-0" aria-hidden />
              <span className="text-[10px] text-graphite/32 leading-snug line-clamp-1">
                {item.title}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
