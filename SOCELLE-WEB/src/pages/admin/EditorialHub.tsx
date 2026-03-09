import { useEffect, useState, useCallback } from 'react';
import {
  Newspaper,
  RefreshCw,
  ShieldAlert,
  AlertCircle,
  ExternalLink,
  Clock,
  Tag,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ErrorState from '../../components/ErrorState';

// ── W12-11: Editorial Hub — Admin Control Center ──────────────────────────
// Data source: rss_items + rss_sources tables (LIVE)
// isLive = true when DB-connected; false fallback shows DEMO badge

interface RssItem {
  id: string;
  title: string;
  link: string | null;
  description: string | null;
  author: string | null;
  published_at: string | null;
  created_at: string;
  is_new: boolean;
  confidence_score: number;
  attribution_text: string;
  brand_mentions: string[];
  vertical_tags: string[];
}

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function confidenceBadge(score: number) {
  if (score >= 0.8) return { label: 'High', cls: 'bg-green-100 text-green-800' };
  if (score >= 0.5) return { label: 'Medium', cls: 'bg-amber-100 text-amber-800' };
  return { label: 'Low', cls: 'bg-red-100 text-red-800' };
}

export default function EditorialHub() {
  const [rows, setRows] = useState<RssItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: dbError } = await supabase
        .from('rss_items')
        .select('id, title, link, description, author, published_at, created_at, is_new, confidence_score, attribution_text, brand_mentions, vertical_tags')
        .order('published_at', { ascending: false, nullsFirst: false })
        .limit(50);

      if (dbError) throw dbError;
      setRows(data ?? []);
      setIsLive(true);
    } catch (err: any) {
      console.error('EditorialHub: load error', err);
      const msg = err?.message?.toLowerCase() || '';
      if (msg.includes('does not exist') || err?.code === '42P01') {
        setIsLive(false);
        setRows([]);
      } else {
        setError('Failed to load editorial data.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (error) {
    return (
      <ErrorState
        icon={ShieldAlert}
        title="Editorial Hub Unavailable"
        message={error}
        action={{ label: 'Retry', onClick: loadData }}
      />
    );
  }

  const newCount = rows.filter((r) => r.is_new).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-sans text-graphite">
              Editorial Hub<span className="text-accent">.</span>
            </h1>
            {!isLive && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 font-sans">
                <AlertCircle className="w-3 h-3" />
                DEMO
              </span>
            )}
          </div>
          <p className="text-graphite/60 font-sans mt-1">
            Industry news and RSS feed management
          </p>
        </div>
        <button
          type="button"
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-accent-soft text-graphite hover:bg-accent-soft disabled:opacity-60 font-sans text-sm transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Summary */}
      {isLive && !loading && rows.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="bg-white border border-accent-soft rounded-xl p-4">
            <p className="text-sm font-medium text-graphite/60 font-sans">Total Items</p>
            <p className="mt-2 text-3xl font-sans text-graphite">{rows.length}</p>
          </div>
          <div className="bg-white border border-accent-soft rounded-xl p-4">
            <p className="text-sm font-medium text-graphite/60 font-sans">New / Unread</p>
            <p className="mt-2 text-3xl font-sans text-graphite">{newCount}</p>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <LoadingSkeleton />
      ) : !isLive ? (
        <div className="bg-white border border-accent-soft rounded-xl p-12 text-center">
          <Newspaper className="w-12 h-12 text-accent-soft mx-auto mb-4" />
          <h3 className="text-lg font-sans text-graphite mb-2">Editorial Hub</h3>
          <p className="text-graphite/60 font-sans text-sm max-w-md mx-auto">
            RSS items table not available in this environment. Connect Supabase and run the ingest-rss function to activate.
          </p>
          <span className="inline-flex items-center gap-1 mt-4 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 font-sans">
            <AlertCircle className="w-3 h-3" />
            DEMO
          </span>
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white border border-accent-soft rounded-xl p-12 text-center">
          <Newspaper className="w-12 h-12 text-accent-soft mx-auto mb-4" />
          <p className="text-graphite/60 font-sans text-sm">No RSS items ingested yet. Run the ingest-rss Edge Function to populate.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((item) => {
            const conf = confidenceBadge(item.confidence_score);
            return (
              <div key={item.id} className="bg-white border border-accent-soft rounded-xl overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {item.is_new && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 font-sans uppercase">
                            New
                          </span>
                        )}
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium font-sans ${conf.cls}`}>
                          {conf.label} confidence
                        </span>
                      </div>
                      <h3 className="text-sm font-medium text-graphite font-sans leading-snug mb-1">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-xs text-graphite/60 font-sans line-clamp-2 mb-2">
                          {item.description}
                        </p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-graphite/60 font-sans">
                        {item.author && <span>By {item.author}</span>}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(item.published_at)}
                        </span>
                        {item.brand_mentions.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            {item.brand_mentions.slice(0, 3).join(', ')}
                          </span>
                        )}
                        {item.link && (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-graphite transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Source
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-white border border-accent-soft rounded-xl p-5 animate-pulse">
          <div className="space-y-2">
            <div className="h-4 bg-accent-soft rounded w-2/3" />
            <div className="h-3 bg-accent-soft rounded w-full" />
            <div className="h-3 bg-accent-soft rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
