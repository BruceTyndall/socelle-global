import { useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  AlertCircle,
  Loader2,
  DollarSign,
  Calendar,
  User,
  Building2,
  Mail,
  Phone,
  MessageSquare,
  FileText,
  Trophy,
  XCircle,
  Plus,
  Send,
} from 'lucide-react';
import { useDeal } from '../../lib/useDeals';
import { useDealActivities, type NewDealActivity } from '../../lib/useDealActivities';
import { useProposals } from '../../lib/useProposals';
import { supabase } from '../../lib/supabase';

// ── WO-OVERHAUL-14: Deal Detail (Business Portal) ───────────────────────
// Data source: deals + deal_activities + proposals (LIVE when DB-connected)

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const ACTIVITY_TYPES = [
  { value: 'call', label: 'Call', icon: Phone },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'meeting', label: 'Meeting', icon: User },
  { value: 'note', label: 'Note', icon: MessageSquare },
];

export default function DealDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { deal, loading: dealLoading, isLive, reload: reloadDeal } = useDeal(id);
  const { activities, loading: actLoading, addActivity } = useDealActivities(id);
  const { proposals, loading: propLoading } = useProposals(id);

  const loading = dealLoading || actLoading || propLoading;

  // Activity form state
  const [showAddActivity, setShowAddActivity] = useState(false);
  const [actType, setActType] = useState('note');
  const [actDescription, setActDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Won/Lost state
  const [showWonLost, setShowWonLost] = useState<'won' | 'lost' | null>(null);
  const [reason, setReason] = useState('');

  const handleAddActivity = useCallback(async () => {
    if (!actDescription.trim() || !id) return;
    setSubmitting(true);
    try {
      const activity: NewDealActivity = {
        deal_id: id,
        activity_type: actType,
        description: actDescription.trim(),
      };
      await addActivity(activity);
      setActDescription('');
      setShowAddActivity(false);
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  }, [id, actType, actDescription, addActivity]);

  const handleMarkDeal = useCallback(async (status: 'won' | 'lost') => {
    if (!id) return;
    setSubmitting(true);
    try {
      const updates: Record<string, unknown> = {
        status,
        updated_at: new Date().toISOString(),
      };
      if (status === 'won') updates.won_reason = reason || null;
      if (status === 'lost') updates.lost_reason = reason || null;
      await supabase.from('deals').update(updates).eq('id', id);
      setShowWonLost(null);
      setReason('');
      reloadDeal();
    } catch {
      // silent
    } finally {
      setSubmitting(false);
    }
  }, [id, reason, reloadDeal]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 text-center">
        <p className="text-graphite/60 font-sans">Deal not found.</p>
        <Link to="/portal/sales" className="text-accent text-sm font-sans hover:underline mt-4 inline-block">
          Back to Sales
        </Link>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    open: 'bg-accent/10 text-accent',
    won: 'bg-signal-up/10 text-signal-up',
    lost: 'bg-signal-down/10 text-signal-down',
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back + Header */}
      <div>
        <Link to="/portal/sales" className="inline-flex items-center gap-1.5 text-sm font-sans text-graphite/50 hover:text-graphite transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Sales
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-sans font-semibold text-graphite">{deal.title}</h1>
              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[deal.status] ?? 'bg-graphite/10 text-graphite/60'}`}>
                {deal.status}
              </span>
              {!isLive && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-signal-warn/10 text-signal-warn font-sans">
                  <AlertCircle className="w-3 h-3" />
                  DEMO
                </span>
              )}
            </div>
            <p className="text-graphite/60 font-sans mt-1">
              Created {formatDate(deal.created_at)}
            </p>
          </div>
          {deal.status === 'open' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowWonLost('won')}
                className="inline-flex items-center gap-2 h-10 px-5 bg-signal-up text-white text-sm font-sans font-semibold rounded-full hover:bg-signal-up/90 transition-colors"
              >
                <Trophy className="w-4 h-4" />
                Mark Won
              </button>
              <button
                onClick={() => setShowWonLost('lost')}
                className="inline-flex items-center gap-2 h-10 px-5 bg-signal-down text-white text-sm font-sans font-semibold rounded-full hover:bg-signal-down/90 transition-colors"
              >
                <XCircle className="w-4 h-4" />
                Mark Lost
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Won/Lost modal */}
      {showWonLost && (
        <div className="bg-white rounded-2xl border border-graphite/8 p-6">
          <h3 className="text-lg font-sans font-semibold text-graphite mb-3">
            {showWonLost === 'won' ? 'Mark as Won' : 'Mark as Lost'}
          </h3>
          <textarea
            placeholder={showWonLost === 'won' ? 'Why was this deal won? (optional)' : 'Why was this deal lost? (optional)'}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-graphite/15 rounded-lg text-sm font-sans text-graphite bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none"
          />
          <div className="flex items-center gap-3 mt-4">
            <button
              onClick={() => handleMarkDeal(showWonLost)}
              disabled={submitting}
              className={`h-10 px-5 text-white text-sm font-sans font-semibold rounded-full transition-colors ${
                showWonLost === 'won' ? 'bg-signal-up hover:bg-signal-up/90' : 'bg-signal-down hover:bg-signal-down/90'
              }`}
            >
              {submitting ? 'Saving...' : 'Confirm'}
            </button>
            <button onClick={() => { setShowWonLost(null); setReason(''); }} className="text-sm text-graphite/50 hover:text-graphite font-sans">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Deal Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Deal Details */}
        <div className="bg-white rounded-2xl border border-graphite/8 p-6 space-y-4">
          <h2 className="text-base font-sans font-semibold text-graphite">Deal Details</h2>
          <div className="space-y-3">
            <InfoRow icon={DollarSign} label="Value" value={formatCurrency(deal.value)} />
            <InfoRow icon={Calendar} label="Expected Close" value={deal.expected_close_date ? formatDate(deal.expected_close_date) : 'Not set'} />
            <div className="flex items-center gap-3">
              <span className="text-xs font-sans text-graphite/50 w-28">Probability</span>
              <div className="flex-1 flex items-center gap-2">
                <div className="flex-1 h-2 bg-graphite/8 rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: `${deal.probability}%` }} />
                </div>
                <span className="text-sm font-sans font-medium text-graphite">{deal.probability}%</span>
              </div>
            </div>
            <InfoRow icon={FileText} label="Currency" value={deal.currency} />
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-2xl border border-graphite/8 p-6 space-y-4">
          <h2 className="text-base font-sans font-semibold text-graphite">Contact Information</h2>
          <div className="space-y-3">
            <InfoRow icon={User} label="Contact" value={deal.contact_name ?? 'Not set'} />
            <InfoRow icon={Mail} label="Email" value={deal.contact_email ?? 'Not set'} />
            <InfoRow icon={Building2} label="Company" value={deal.company_name ?? 'Not set'} />
            <InfoRow icon={User} label="Owner" value={deal.owner_id ?? 'Unassigned'} />
          </div>
        </div>
      </div>

      {/* Proposals */}
      <div className="bg-white rounded-2xl border border-graphite/8 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-sans font-semibold text-graphite">Proposals</h2>
          <Link
            to={`/portal/sales/proposals/new?deal_id=${id}`}
            className="inline-flex items-center gap-1.5 h-8 px-4 bg-graphite text-white text-xs font-sans font-semibold rounded-full hover:bg-graphite/90 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Proposal
          </Link>
        </div>
        {proposals.length === 0 ? (
          <p className="text-sm text-graphite/50 font-sans">No proposals yet.</p>
        ) : (
          <div className="space-y-2">
            {proposals.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-3 border-b border-graphite/5 last:border-0">
                <div>
                  <p className="text-sm font-sans font-medium text-graphite">{p.title}</p>
                  <p className="text-xs font-sans text-graphite/50">
                    {formatCurrency(p.total_value)} &middot; {formatDate(p.created_at)}
                  </p>
                </div>
                <ProposalStatusBadge status={p.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-2xl border border-graphite/8 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-sans font-semibold text-graphite">Activity Timeline</h2>
          <button
            onClick={() => setShowAddActivity(!showAddActivity)}
            className="inline-flex items-center gap-1.5 h-8 px-4 bg-graphite text-white text-xs font-sans font-semibold rounded-full hover:bg-graphite/90 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Activity
          </button>
        </div>

        {/* Add Activity Form */}
        {showAddActivity && (
          <div className="mb-6 p-4 bg-mn-surface/50 rounded-xl border border-graphite/8">
            <div className="flex items-center gap-2 mb-3">
              {ACTIVITY_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setActType(t.value)}
                  className={`inline-flex items-center gap-1.5 h-8 px-3 rounded-full text-xs font-sans font-medium transition-colors ${
                    actType === t.value
                      ? 'bg-graphite text-white'
                      : 'bg-white border border-graphite/15 text-graphite/70 hover:text-graphite'
                  }`}
                >
                  <t.icon className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              ))}
            </div>
            <textarea
              placeholder="Describe this activity..."
              value={actDescription}
              onChange={(e) => setActDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-graphite/15 rounded-lg text-sm font-sans text-graphite bg-white focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none"
            />
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={handleAddActivity}
                disabled={submitting || !actDescription.trim()}
                className="inline-flex items-center gap-1.5 h-8 px-4 bg-graphite text-white text-xs font-sans font-semibold rounded-full hover:bg-graphite/90 transition-colors disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {submitting ? 'Saving...' : 'Save'}
              </button>
              <button onClick={() => { setShowAddActivity(false); setActDescription(''); }} className="text-xs text-graphite/50 hover:text-graphite font-sans">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Timeline */}
        {activities.length === 0 ? (
          <p className="text-sm text-graphite/50 font-sans">No activities recorded.</p>
        ) : (
          <div className="space-y-4">
            {activities.map((a) => {
              const typeInfo = ACTIVITY_TYPES.find((t) => t.value === a.activity_type);
              const Icon = typeInfo?.icon ?? MessageSquare;
              return (
                <div key={a.id} className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-sans font-semibold text-graphite capitalize">{a.activity_type}</span>
                      <span className="text-xs font-sans text-graphite/40">{formatDate(a.performed_at)}</span>
                    </div>
                    <p className="text-sm font-sans text-graphite/70">{a.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="w-4 h-4 text-graphite/30 flex-shrink-0" />
      <span className="text-xs font-sans text-graphite/50 w-24">{label}</span>
      <span className="text-sm font-sans text-graphite">{value}</span>
    </div>
  );
}

function ProposalStatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    draft: 'bg-graphite/10 text-graphite/60',
    sent: 'bg-accent/10 text-accent',
    viewed: 'bg-signal-warn/10 text-signal-warn',
    accepted: 'bg-signal-up/10 text-signal-up',
    rejected: 'bg-signal-down/10 text-signal-down',
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${colors[status] ?? 'bg-graphite/10 text-graphite/60'}`}>
      {status}
    </span>
  );
}
