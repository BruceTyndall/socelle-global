// ── VersionHistory — AUTH-CORE-03 ─────────────────────────────────────
// Timeline of draft/published/archived versions for a CMS entity.
// Admin-only restore action. TanStack Query v5. Pearl Mineral V2.

import { useQuery } from '@tanstack/react-query';
import { RotateCcw, Clock, CheckCircle2, Archive } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../lib/auth';

// ── Types ──────────────────────────────────────────────────────────────

interface CmsVersion {
  id: string;
  entity_type: 'block' | 'page' | 'post';
  entity_id: string;
  version_number: number;
  status: 'draft' | 'published' | 'archived';
  content: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
  published_at: string | null;
}

export interface VersionHistoryProps {
  entityType: 'block' | 'page' | 'post';
  entityId: string;
  onRestore?: (versionId: string) => void;
}

// ── Helpers ────────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ── Status badge ───────────────────────────────────────────────────────

function StatusBadge({ status }: { status: CmsVersion['status'] }) {
  const config = {
    draft: {
      icon: <Clock className="w-3 h-3" />,
      label: 'Draft',
      className: 'bg-signal-warn/10 text-signal-warn',
    },
    published: {
      icon: <CheckCircle2 className="w-3 h-3" />,
      label: 'Published',
      className: 'bg-signal-up/10 text-signal-up',
    },
    archived: {
      icon: <Archive className="w-3 h-3" />,
      label: 'Archived',
      className: 'bg-graphite/10 text-graphite/60',
    },
  }[status];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${config.className}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
}

// ── Skeleton ───────────────────────────────────────────────────────────

function VersionSkeleton() {
  return (
    <div className="animate-pulse flex items-start gap-3 py-3 border-b border-graphite/10 last:border-0">
      <div className="w-8 h-8 rounded-full bg-graphite/10 shrink-0 mt-0.5" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 w-28 rounded bg-graphite/10" />
        <div className="h-3 w-44 rounded bg-graphite/8" />
      </div>
      <div className="h-6 w-16 rounded-full bg-graphite/10" />
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────

export function VersionHistory({ entityType, entityId, onRestore }: VersionHistoryProps) {
  const { isAdmin } = useAuth();

  const {
    data: versions = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['cms_versions', entityType, entityId],
    queryFn: async (): Promise<CmsVersion[]> => {
      const { data, error: dbErr } = await supabase
        .from('cms_versions')
        .select('*')
        .eq('entity_type', entityType)
        .eq('entity_id', entityId)
        .order('version_number', { ascending: false });

      if (dbErr) {
        if (dbErr.code === '42P01') return [];   // table not yet created — graceful
        throw new Error(dbErr.message);
      }
      return (data ?? []) as CmsVersion[];
    },
    enabled: isSupabaseConfigured && !!entityId,
  });

  // ── Loading ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="divide-y divide-graphite/10">
        {[1, 2, 3].map((i) => (
          <VersionSkeleton key={i} />
        ))}
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="py-6 text-center">
        <p className="text-sm text-graphite/60 mb-3">
          Unable to load version history.
        </p>
        <button
          onClick={() => refetch()}
          className="text-xs font-medium text-accent hover:text-accent-hover underline"
        >
          Retry
        </button>
      </div>
    );
  }

  // ── Empty ────────────────────────────────────────────────────────────
  if (versions.length === 0) {
    return (
      <div className="py-8 text-center">
        <Clock className="w-8 h-8 text-graphite/20 mx-auto mb-2" />
        <p className="text-sm text-graphite/50">No version history yet.</p>
      </div>
    );
  }

  // ── List ─────────────────────────────────────────────────────────────
  return (
    <div className="divide-y divide-graphite/10">
      {versions.map((v) => (
        <div key={v.id} className="flex items-start gap-3 py-3">
          {/* Version number circle */}
          <div className="w-8 h-8 rounded-full bg-accent-soft flex items-center justify-center text-[11px] font-bold text-accent shrink-0 mt-0.5">
            v{v.version_number}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusBadge status={v.status} />
              <span className="text-xs text-graphite/40">{relativeTime(v.created_at)}</span>
            </div>
            {v.published_at && (
              <p className="text-[11px] text-graphite/40 mt-0.5">
                Published {relativeTime(v.published_at)}
              </p>
            )}
          </div>

          {/* Restore (admin only) */}
          {isAdmin && onRestore && (
            <button
              onClick={() => onRestore(v.id)}
              title={`Restore version ${v.version_number}`}
              className="flex items-center gap-1 text-[11px] font-medium text-accent hover:text-accent-hover transition-colors shrink-0"
            >
              <RotateCcw className="w-3 h-3" />
              Restore
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
