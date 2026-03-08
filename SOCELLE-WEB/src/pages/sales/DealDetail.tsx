import { useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  AlertCircle,
  Loader2,
  Phone,
  Mail,
  Calendar,
  StickyNote,
  Plus,
  CheckCircle,
  XCircle,
  DollarSign,
  Building2,
  User,
  FileText,
  Edit,
} from 'lucide-react';
import { useDeal } from '../../lib/useDeals';
import { useDealActivities, type NewDealActivity } from '../../lib/useDealActivities';
import { useProposals } from '../../lib/useProposals';
import { useDeals } from '../../lib/useDeals';

// ── WO-OVERHAUL-14: Deal Detail ─────────────────────────────────────────
// Data source: deals + deal_activities + proposals (LIVE when DB-connected)

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

const ACTIVITY_TYPES = [
  { value: 'call', label: 'Call', icon: Phone },
  { value: 'email', label: 'Email', icon: Mail },
  { value: 'meeting', label: 'Meeting', icon: Calendar },
  { value: 'note', label: 'Note', icon: StickyNote },
] as const;

const ACTIVITY_ICONS: Record<string, typeof Phone> = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  note: StickyNote,
};

export default function DealDetail() {
  const { id } = useParams<{ id: string }>();
  const { deal, loading, isLive, reload: reloadDeal } = useDeal(id);
  const { activities, loading: actLoading, addActivity } = useDealActivities(id);
  const { proposals } = useProposals(id);
  const { updateDeal } = useDeals();

  const [showAddActivity, setShowAddActivity] = useState(false);
  const [actType, setActType] = useState('note');
  const [actDesc, setActDesc] = useState('');
  const [showOutcome, setShowOutcome] = useState<'won' | 'lost' | null>(null);
  const [outcomeReason, setOutcomeReason] = useState('');

  const handleAddActivity = useCallback(async () => {
    if (!actDesc.trim() || !id) return;
    const activity: NewDealActivity = {
      deal_id: id,
      activity_type: actType,
      description: actDesc.trim(),
    };
    try {
      await addActivity(activity);
      setActDesc('');
      setShowAddActivity(false);
    } catch {
      // silent
    }
  }, [id, actType, actDesc, addActivity]);

  const handleOutcome = useCallback(async (status: 'won' | 'lost') => {
    if (!id) return;
    try {
      await updateDeal(id, {
        status,
        ...(status === 'won' ? { won_reason: outcomeReason } : { lost_reason: outcomeReason }),
      });
      setShowOutcome(null);
      setOutcomeReason('');
      reloadDeal();
    } catch {
      // silent
    }
  }, [id, outcomeReason, updateDeal, reloadDeal]);

  if (loading || actLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <p className="text-graphite/50 font-sans">Deal not found.</p>
        <Link to="/sales" className="text-accent text-sm font-sans hover:underline mt-2 inline-block">Back to Sales</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb */}
      <Link to="/sales" className="inline-flex items-center gap-1.5 text-sm font-sans text-graphite/50 hover:text-accent transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Sales
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-sans font-semibold text-graphite">{deal.title}</h1>
            {!isLive && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-signal-warn/10 text-signal-warn font-sans">
                <AlertCircle className="w-3 h-3" />
                DEMO
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm font-sans text-graphite/60">
            <StatusBadge status={deal.status} />
            <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" />{formatCurrency(deal.value)}</span>
            <span>{deal.probability}% probability</span>
            {deal.expected_close_date && <span>Close: {formatDate(deal.expected_close_date)}</span>}
          </div>
        </div>

        {deal.status === 'open' && (
          <div className="flex gap-2">
            <Link
              to={`/sales/deals/${id}/edit`}
              className="inline-flex items-center gap-1.5 h-9 px-4 border border-graphite/15 text-graphite text-sm font-sans font-semibold rounded-full hover:bg-mn-surface transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Link>
            <button
              onClick={() => setShowOutcome('won')}
              className="inline-flex items-center gap-1.5 h-9 px-4 bg-signal-up/10 text-signal-up text-sm font-sans font-semibold rounded-full hover:bg-signal-up/20 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Won
            </button>
            <button
              onClick={() => setShowOutcome('lost')}
              className="inline-flex items-center gap-1.5 h-9 px-4 bg-signal-down/10 text-signal-down text-sm font-sans font-semibold rounded-full hover:bg-signal-down/20 transition-colors"
            >
              <XCircle className="w-4 h-4" />
              Lost
            </button>
          </div>
        )}
      </div>

      {/* Outcome modal */}
      {showOutcome && (
        <div className="bg-white rounded-2xl border border-graphite/10 p-6 space-y-4">
          <h3 className="text-lg font-sans font-semibold text-graphite">
            Mark as {showOutcome === 'won' ? 'Won' : 'Lost'}
          </h3>
          <textarea
            placeholder={showOutcome === 'won' ? 'Why did we win?' : 'Why did we lose?'}
            value={outcomeReason}
            onChange={(e) => setOutcomeReason(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-graphite/15 rounded-xl text-sm font-sans text-graphite bg-white resize-none focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
          <div className="flex gap-2">
            <button
              onClick={() => handleOutcome(showOutcome)}
              className="h-9 px-5 bg-graphite text-white text-sm font-sans font-semibold rounded-full hover:bg-graphite/90 transition-colors"
            >
              Confirm
            </button>
            <button
              onClick={() => { setShowOutcome(null); setOutcomeReason(''); }}
              className="h-9 px-5 border border-graphite/15 text-graphite text-sm font-sans rounded-full hover:bg-mn-surface transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: contact + proposals */}
        <div className="space-y-6">
          {/* Contact */}
          <div className="bg-white rounded-2xl border border-graphite/8 p-5 space-y-3">
            <h3 className="text-sm font-sans font-semibold text-graphite/50 uppercase tracking-wider">Contact</h3>
            {deal.contact_name && (
              <div className="flex items-center gap-2 text-sm font-sans text-graphite">
                <User className="w-4 h-4 text-graphite/30" />
                {deal.contact_name}
              </div>
            )}
            {deal.contact_email && (
              <div className="flex items-center gap-2 text-sm font-sans text-graphite">
                <Mail className="w-4 h-4 text-graphite/30" />
                {deal.contact_email}
              </div>
            )}
            {deal.company_name && (
              <div className="flex items-center gap-2 text-sm font-sans text-graphite">
                <Building2 className="w-4 h-4 text-graphite/30" />
                {deal.company_name}
              </div>
            )}
            {!deal.contact_name && !deal.contact_email && !deal.company_name && (
              <p className="text-sm font-sans text-graphite/40">No contact info.</p>
            )}
          </div>

          {/* Proposals */}
          <div className="bg-white rounded-2xl border border-graphite/8 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-sans font-semibold text-graphite/50 uppercase tracking-wider">Proposals</h3>
              <Link
                to={`/sales/proposals/new?deal=${id}`}
                className="text-xs font-sans text-accent hover:underline"
              >
                + New
              </Link>
            </div>
            {proposals.length === 0 ? (
              <p className="text-sm font-sans text-graphite/40">No proposals yet.</p>
            ) : (
              <div className="space-y-2">
                {proposals.map((p) => (
                  <Link
                    key={p.id}
                    to={`/sales/proposals/${p.id}/view`}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-mn-surface transition-colors"
                  >
                    <FileText className="w-4 h-4 text-graphite/30" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-sans text-graphite truncate">{p.title}</p>
                      <p className="text-xs font-sans text-graphite/40">{p.status} &middot; {formatCurrency(p.total_value)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: activity timeline */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-sans font-semibold text-graphite">Activity Timeline</h3>
            <button
              onClick={() => setShowAddActivity(!showAddActivity)}
              className="inline-flex items-center gap-1.5 h-9 px-4 bg-graphite text-white text-sm font-sans font-semibold rounded-full hover:bg-graphite/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Activity
            </button>
          </div>

          {/* Add activity form */}
          {showAddActivity && (
            <div className="bg-white rounded-2xl border border-graphite/8 p-5 space-y-4">
              <div className="flex gap-2">
                {ACTIVITY_TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setActType(t.value)}
                    className={`flex items-center gap-1.5 h-8 px-3 text-xs font-sans rounded-full border transition-colors ${
                      actType === t.value
                        ? 'bg-graphite text-white border-graphite'
                        : 'border-graphite/15 text-graphite/60 hover:bg-mn-surface'
                    }`}
                  >
                    <t.icon className="w-3.5 h-3.5" />
                    {t.label}
                  </button>
                ))}
              </div>
              <textarea
                placeholder="Describe the activity..."
                value={actDesc}
                onChange={(e) => setActDesc(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-graphite/15 rounded-xl text-sm font-sans text-graphite bg-white resize-none focus:outline-none focus:ring-2 focus:ring-accent/30"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddActivity}
                  className="h-9 px-5 bg-graphite text-white text-sm font-sans font-semibold rounded-full hover:bg-graphite/90 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => { setShowAddActivity(false); setActDesc(''); }}
                  className="h-9 px-5 border border-graphite/15 text-graphite text-sm font-sans rounded-full hover:bg-mn-surface transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Timeline */}
          {activities.length === 0 ? (
            <p className="text-graphite/50 font-sans text-sm py-8 text-center">No activities recorded yet.</p>
          ) : (
            <div className="space-y-1">
              {activities.map((a) => {
                const Icon = ACTIVITY_ICONS[a.activity_type] ?? StickyNote;
                return (
                  <div key={a.id} className="flex gap-3 py-3 border-b border-graphite/5 last:border-0">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-mn-surface flex items-center justify-center">
                      <Icon className="w-4 h-4 text-graphite/40" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-sans font-semibold text-graphite/60 uppercase">{a.activity_type}</span>
                        <span className="text-xs font-sans text-graphite/30">{formatDateTime(a.performed_at)}</span>
                      </div>
                      <p className="text-sm font-sans text-graphite mt-0.5">{a.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    open: 'bg-accent/10 text-accent',
    won: 'bg-signal-up/10 text-signal-up',
    lost: 'bg-signal-down/10 text-signal-down',
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${colors[status] ?? 'bg-graphite/10 text-graphite/60'}`}>
      {status}
    </span>
  );
}
