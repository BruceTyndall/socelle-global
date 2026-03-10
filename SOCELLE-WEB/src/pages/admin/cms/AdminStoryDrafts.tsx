/* ═══════════════════════════════════════════════════════════════
   AdminStoryDrafts — CMS-WO-07
   Story draft queue: RSS items waiting for editorial approval.
   Tabs: pending | approved | rejected | published
   Approve → sets status='approved' (CMS-WO-08 adds auto-promote to cms_posts)
   Reject  → sets status='rejected' + reason
   ═══════════════════════════════════════════════════════════════ */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, ExternalLink, RefreshCw, FileText } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../lib/auth';

// ── Types ──────────────────────────────────────────────────────────────────
type DraftStatus = 'pending' | 'approved' | 'rejected' | 'published';

interface StoryDraft {
  id:              string;
  title:           string;
  excerpt:         string | null;
  hero_image:      string | null;
  source_url:      string | null;
  source_name:     string | null;
  vertical:        string | null;
  tags:            string[];
  status:          DraftStatus;
  reviewed_at:     string | null;
  rejection_reason: string | null;
  created_at:      string;
  // joined
  feed?: { name: string } | null;
}

// ── Tabs ───────────────────────────────────────────────────────────────────
const TABS: { key: DraftStatus; label: string }[] = [
  { key: 'pending',   label: 'Pending' },
  { key: 'approved',  label: 'Approved' },
  { key: 'rejected',  label: 'Rejected' },
  { key: 'published', label: 'Published' },
];

// ── Skeleton ────────────────────────────────────────────────────────────────
function DraftSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="border border-graphite/8 rounded-lg p-4 bg-mn-card flex gap-4">
          <div className="w-20 h-14 rounded bg-graphite/8 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-graphite/8 rounded w-2/3" />
            <div className="h-3 bg-graphite/5 rounded w-full" />
            <div className="h-3 bg-graphite/5 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Empty ────────────────────────────────────────────────────────────────────
function EmptyDrafts({ status }: { status: DraftStatus }) {
  const messages: Record<DraftStatus, string> = {
    pending:   'No pending drafts. feeds-to-drafts runs every hour at :15.',
    approved:  'No approved drafts yet.',
    rejected:  'No rejected drafts.',
    published: 'No published drafts yet.',
  };
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-full bg-graphite/5 flex items-center justify-center mb-4" aria-hidden>
        <FileText className="w-5 h-5 text-graphite/25" />
      </div>
      <p className="text-sm font-medium text-graphite/45 mb-1">{messages[status]}</p>
      <p className="text-xs text-graphite/28 max-w-xs">
        Stories are auto-drafted from RSS feeds and appear here for review.
      </p>
    </div>
  );
}

// ── Draft Row ─────────────────────────────────────────────────────────────────
function DraftRow({
  draft,
  onApprove,
  onReject,
  approving,
  rejecting,
}: {
  draft: StoryDraft;
  onApprove: (id: string) => void;
  onReject:  (id: string, reason: string) => void;
  approving: boolean;
  rejecting: boolean;
}) {
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason]         = useState('');
  const isPending = draft.status === 'pending';

  function submitReject() {
    if (!reason.trim()) return;
    onReject(draft.id, reason.trim());
    setShowReject(false);
    setReason('');
  }

  return (
    <div className="border border-graphite/8 rounded-lg bg-mn-card overflow-hidden">
      <div className="flex gap-4 p-4">
        {/* Thumbnail */}
        {draft.hero_image ? (
          <img
            src={draft.hero_image}
            alt=""
            className="w-20 h-14 object-cover rounded shrink-0 bg-graphite/5"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="w-20 h-14 rounded shrink-0 bg-graphite/5" aria-hidden />
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-sm font-semibold text-graphite leading-snug line-clamp-2">
              {draft.title}
            </h3>
            <StatusBadge status={draft.status} />
          </div>

          {draft.excerpt && (
            <p className="text-xs text-graphite/50 line-clamp-2 mb-2">{draft.excerpt}</p>
          )}

          <div className="flex items-center gap-3 text-[10px] text-graphite/35 font-mono">
            {draft.vertical && <span className="uppercase">{draft.vertical}</span>}
            {draft.feed?.name && <span>{draft.feed.name}</span>}
            <span>{new Date(draft.created_at).toLocaleDateString()}</span>
            {draft.source_url && (
              <a
                href={draft.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-0.5 text-accent/60 hover:text-accent transition-colors"
              >
                Source <ExternalLink className="w-2.5 h-2.5" aria-hidden />
              </a>
            )}
          </div>
        </div>

        {/* Actions — pending only */}
        {isPending && (
          <div className="flex flex-col gap-1.5 shrink-0">
            <button
              onClick={() => onApprove(draft.id)}
              disabled={approving}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-signal-up bg-signal-up/8 hover:bg-signal-up/14 rounded transition-colors disabled:opacity-50"
            >
              <CheckCircle className="w-3.5 h-3.5" aria-hidden />
              Approve
            </button>
            <button
              onClick={() => setShowReject((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-signal-down bg-signal-down/8 hover:bg-signal-down/14 rounded transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" aria-hidden />
              Reject
            </button>
          </div>
        )}

        {/* Rejection info — rejected */}
        {draft.status === 'rejected' && draft.rejection_reason && (
          <div className="shrink-0 max-w-[160px] text-xs text-graphite/40 italic line-clamp-3">
            "{draft.rejection_reason}"
          </div>
        )}
      </div>

      {/* Inline reject form */}
      {showReject && (
        <div className="border-t border-graphite/6 px-4 py-3 bg-graphite/2 flex items-center gap-2">
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Rejection reason (required)"
            className="flex-1 text-xs border-b border-graphite/15 bg-transparent py-1 focus:outline-none focus:border-graphite/35 text-graphite placeholder:text-graphite/30"
            autoFocus
          />
          <button
            onClick={submitReject}
            disabled={!reason.trim() || rejecting}
            className="px-3 py-1 text-xs font-medium text-signal-down bg-signal-down/10 hover:bg-signal-down/18 rounded disabled:opacity-40 transition-colors"
          >
            Confirm
          </button>
          <button
            onClick={() => { setShowReject(false); setReason(''); }}
            className="px-3 py-1 text-xs text-graphite/40 hover:text-graphite/65 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: DraftStatus }) {
  const map: Record<DraftStatus, string> = {
    pending:   'bg-signal-warn/10 text-signal-warn',
    approved:  'bg-signal-up/10 text-signal-up',
    rejected:  'bg-signal-down/10 text-signal-down',
    published: 'bg-accent/10 text-accent',
  };
  return (
    <span className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded-pill shrink-0 ${map[status]}`}>
      {status}
    </span>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function AdminStoryDrafts() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<DraftStatus>('pending');
  const [actionId,  setActionId]  = useState<string | null>(null);

  // ── Query ──────────────────────────────────────────────────────
  const { data: drafts = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['story_drafts', activeTab],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('story_drafts')
        .select('*, feed:feed_id(name)')
        .eq('status', activeTab)
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return (data ?? []) as StoryDraft[];
    },
    staleTime: 30_000,
  });

  // ── Counts per tab ─────────────────────────────────────────────
  const { data: counts } = useQuery({
    queryKey: ['story_drafts_counts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('story_drafts')
        .select('status');
      if (error) return {} as Record<DraftStatus, number>;
      const result: Record<string, number> = {};
      (data ?? []).forEach((r) => { result[r.status] = (result[r.status] ?? 0) + 1; });
      return result as Record<DraftStatus, number>;
    },
    staleTime: 30_000,
  });

  // ── Approve mutation ───────────────────────────────────────────
  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      setActionId(id);
      const { error } = await supabase
        .from('story_drafts')
        .update({
          status:      'approved',
          reviewed_by: user?.id ?? null,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['story_drafts'] });
      setActionId(null);
    },
  });

  // ── Reject mutation ────────────────────────────────────────────
  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      setActionId(id);
      const { error } = await supabase
        .from('story_drafts')
        .update({
          status:           'rejected',
          reviewed_by:      user?.id ?? null,
          reviewed_at:      new Date().toISOString(),
          rejection_reason: reason,
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['story_drafts'] });
      setActionId(null);
    },
  });

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-graphite">Story Draft Queue</h1>
          <p className="text-sm text-graphite/45 mt-0.5">
            RSS items auto-drafted hourly · approve to publish, reject to discard
          </p>
        </div>
        <button
          onClick={() => void refetch()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-graphite/55 hover:text-graphite/80 border border-graphite/12 hover:border-graphite/20 rounded transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" aria-hidden />
          Refresh
        </button>
      </div>

      {/* Tab bar */}
      <nav className="flex border-b border-graphite/8 mb-6" role="tablist">
        {TABS.map((tab) => {
          const isActive = tab.key === activeTab;
          const count = counts?.[tab.key];
          return (
            <button
              key={tab.key}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.key)}
              className={[
                'px-4 py-2.5 text-sm font-medium border-b-2 -mb-px flex items-center gap-1.5 transition-colors',
                isActive
                  ? 'border-graphite text-graphite'
                  : 'border-transparent text-graphite/40 hover:text-graphite/65',
              ].join(' ')}
            >
              {tab.label}
              {count != null && count > 0 && (
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${isActive ? 'bg-graphite/10 text-graphite' : 'bg-graphite/6 text-graphite/40'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Content */}
      {isLoading && <DraftSkeleton />}

      {isError && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-sm text-signal-warn mb-3">Failed to load drafts</p>
          <button
            onClick={() => void refetch()}
            className="text-xs text-accent underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !isError && drafts.length === 0 && (
        <EmptyDrafts status={activeTab} />
      )}

      {!isLoading && !isError && drafts.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-graphite/35 mb-3 font-mono">
            {drafts.length} {activeTab} draft{drafts.length !== 1 ? 's' : ''}
          </p>
          {drafts.map((draft) => (
            <DraftRow
              key={draft.id}
              draft={draft}
              onApprove={(id) => approveMutation.mutate(id)}
              onReject={(id, reason) => rejectMutation.mutate({ id, reason })}
              approving={approveMutation.isPending && actionId === draft.id}
              rejecting={rejectMutation.isPending  && actionId === draft.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
