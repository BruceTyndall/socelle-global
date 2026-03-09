import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  RefreshCw,
  ShieldAlert,
  AlertCircle,
  MapPin,
  Globe,
  ExternalLink,
  Star,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ErrorState from '../../components/ErrorState';

// ── W12-11: Events Hub — Admin Control Center ─────────────────────────────
// Data source: events table (LIVE)
// isLive = true when DB-connected; false fallback shows DEMO badge

interface EventRow {
  id: string;
  name: string;
  date: string;
  date_end: string | null;
  location: string;
  type: string;
  verticals: string[];
  description: string;
  url: string;
  attendees: string | null;
  featured: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

const TYPE_COLORS: Record<string, string> = {
  conference: 'bg-blue-100 text-blue-800',
  'trade-show': 'bg-purple-100 text-purple-800',
  workshop: 'bg-green-100 text-green-800',
  virtual: 'bg-cyan-100 text-cyan-800',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  draft: 'bg-amber-100 text-amber-800',
  cancelled: 'bg-red-100 text-red-800',
};

function formatEventDate(date: string, dateEnd: string | null) {
  const start = new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  if (!dateEnd) return start;
  const end = new Date(dateEnd).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return `${start} — ${end}`;
}

export default function EventsHub() {
  const [isLive, setIsLive] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const { data: rows = [], isLoading: loading, error: queryError, refetch: loadData } = useQuery({
    queryKey: ['events', filter],
    queryFn: async () => {
      let query = supabase
        .from('events')
        .select('id, name, date, date_end, location, type, verticals, description, url, attendees, featured, status, created_at, updated_at')
        .order('date', { ascending: true });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error: dbError } = await query;
      if (dbError) {
        const msg = dbError.message?.toLowerCase() || '';
        if (msg.includes('does not exist') || dbError.code === '42P01') {
          setIsLive(false);
          return [];
        }
        throw dbError;
      }
      setIsLive(true);
      return (data as EventRow[]) ?? [];
    },
  });

  const error = queryError ? 'Failed to load events data.' : null;

  if (error) {
    return (
      <ErrorState
        icon={ShieldAlert}
        title="Events Hub Unavailable"
        message={error}
        action={{ label: 'Retry', onClick: () => void loadData() }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-sans text-graphite">
              Events Hub<span className="text-accent">.</span>
            </h1>
            {!isLive && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 font-sans">
                <AlertCircle className="w-3 h-3" />
                DEMO
              </span>
            )}
          </div>
          <p className="text-graphite/60 font-sans mt-1">
            Industry events and conference management
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadData()}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-accent-soft text-graphite hover:bg-accent-soft disabled:opacity-60 font-sans text-sm transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-accent-soft/40 rounded-xl p-1 w-fit">
        {(['all', 'active', 'draft', 'cancelled'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium font-sans transition-colors ${
              filter === f
                ? 'bg-white text-graphite shadow-sm'
                : 'text-graphite/60 hover:text-graphite'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSkeleton />
      ) : !isLive ? (
        <div className="bg-white border border-accent-soft rounded-xl p-12 text-center">
          <Calendar className="w-12 h-12 text-accent-soft mx-auto mb-4" />
          <h3 className="text-lg font-sans text-graphite mb-2">Events Hub</h3>
          <p className="text-graphite/60 font-sans text-sm max-w-md mx-auto">
            Events table not available in this environment. Connect Supabase to activate live events data.
          </p>
          <span className="inline-flex items-center gap-1 mt-4 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 font-sans">
            <AlertCircle className="w-3 h-3" />
            DEMO
          </span>
        </div>
      ) : rows.length === 0 ? (
        <div className="bg-white border border-accent-soft rounded-xl p-12 text-center">
          <Calendar className="w-12 h-12 text-accent-soft mx-auto mb-4" />
          <p className="text-graphite/60 font-sans text-sm">
            {filter === 'all' ? 'No events found.' : `No ${filter} events.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((evt) => (
            <div key={evt.id} className="bg-white border border-accent-soft rounded-xl overflow-hidden">
              {evt.featured && <div className="h-1 bg-accent" />}
              <div className="p-5">
                <div className="flex items-start gap-4">
                  {/* Date block */}
                  <div className="w-14 h-14 rounded-lg bg-accent-soft flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-xs text-graphite/60 font-sans leading-none">
                      {new Date(evt.date).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    <span className="text-xl font-sans text-graphite leading-tight">
                      {new Date(evt.date).getDate()}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-sm font-medium text-graphite font-sans">{evt.name}</h3>
                      {evt.featured && (
                        <Star className="w-3.5 h-3.5 text-accent fill-accent" />
                      )}
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${TYPE_COLORS[evt.type] || 'bg-accent-soft text-graphite'}`}>
                        {evt.type}
                      </span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${STATUS_COLORS[evt.status] || 'bg-accent-soft text-graphite'}`}>
                        {evt.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-graphite/60 font-sans">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {evt.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatEventDate(evt.date, evt.date_end)}
                      </span>
                      {evt.attendees && (
                        <span>{evt.attendees} expected</span>
                      )}
                      {evt.verticals.length > 0 && (
                        <span>{evt.verticals.join(', ')}</span>
                      )}
                      <a
                        href={evt.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 hover:text-graphite transition-colors"
                      >
                        <Globe className="w-3 h-3" />
                        Website
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white border border-accent-soft rounded-xl p-5 animate-pulse">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-lg bg-accent-soft flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-accent-soft rounded w-1/3" />
              <div className="h-3 bg-accent-soft rounded w-2/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
