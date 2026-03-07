import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Plus, Globe, Phone, Mail, MapPin, Send, MessageSquare } from 'lucide-react';
import { useProspectDetail, type NewTouchpoint } from '../../lib/useProspects';
import { useProspects } from '../../lib/useProspects';
import { useAuth } from '../../lib/auth';

const STATUS_OPTIONS = ['new', 'contacted', 'interested', 'meeting_scheduled', 'proposal_sent', 'negotiating', 'won', 'lost', 'dormant'];
const TOUCHPOINT_TYPES = ['call', 'email', 'meeting', 'linkedin', 'event', 'referral', 'note'];

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-50 text-blue-700',
  contacted: 'bg-purple-50 text-purple-700',
  interested: 'bg-green-50 text-green-700',
  meeting_scheduled: 'bg-accent/10 text-accent',
  proposal_sent: 'bg-pro-gold/10 text-pro-gold',
  negotiating: 'bg-signal-warn/10 text-signal-warn',
  won: 'bg-signal-up/10 text-signal-up',
  lost: 'bg-signal-down/10 text-signal-down',
  dormant: 'bg-pro-stone/20 text-pro-warm-gray',
};

export default function ProspectDetail() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const { prospect, touchpoints, loading, isLive, addTouchpoint } = useProspectDetail(id);
  const { updateProspect, markInvited } = useProspects(profile?.business_id);
  const [showAddTp, setShowAddTp] = useState(false);
  const [tpForm, setTpForm] = useState({ type: 'call', subject: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const handleAddTouchpoint = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const payload: NewTouchpoint = {
        prospect_id: id,
        type: tpForm.type,
        subject: tpForm.subject || undefined,
        notes: tpForm.notes || undefined,
      };
      await addTouchpoint(payload);
      setTpForm({ type: 'call', subject: '', notes: '' });
      setShowAddTp(false);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (status: string) => {
    if (!id) return;
    setUpdatingStatus(true);
    try {
      await updateProspect(id, { status });
      window.location.reload();
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleInvite = async () => {
    if (!id) return;
    await markInvited(id);
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-pro-stone/20 rounded w-48 animate-pulse" />
        <div className="bg-white rounded-xl border border-pro-stone/30 p-6 animate-pulse"><div className="h-24 bg-pro-stone/20 rounded" /></div>
      </div>
    );
  }

  if (!prospect) {
    return (
      <div className="text-center py-12">
        <p className="text-pro-warm-gray">Prospect not found</p>
        <Link to="/portal/prospects" className="text-accent text-sm mt-2 inline-block">Back to prospects</Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/portal/prospects" className="w-8 h-8 rounded-full border border-pro-stone/30 flex items-center justify-center hover:border-accent/30 transition-colors">
          <ArrowLeft className="w-4 h-4 text-pro-warm-gray" />
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-pro-charcoal">{prospect.company_name}</h1>
          <p className="text-sm text-pro-warm-gray">{prospect.company_type ?? 'B2B Prospect'}</p>
        </div>
        {!isLive && (
          <span className="text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-full">DEMO</span>
        )}
        <span className={`text-xs font-medium px-3 py-1 rounded-full ${STATUS_COLORS[prospect.status] ?? 'bg-pro-stone/20 text-pro-warm-gray'}`}>
          {prospect.status.replace('_', ' ')}
        </span>
      </div>

      {/* Company Info */}
      <div className="bg-white rounded-xl border border-pro-stone/30 p-5">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          {prospect.contact_name && <div><span className="text-pro-warm-gray">Contact:</span> <span className="text-pro-charcoal font-medium">{prospect.contact_name}</span></div>}
          {prospect.contact_email && <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-pro-warm-gray" /><span className="text-pro-charcoal">{prospect.contact_email}</span></div>}
          {prospect.contact_phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-pro-warm-gray" /><span className="text-pro-charcoal">{prospect.contact_phone}</span></div>}
          {prospect.website && <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-pro-warm-gray" /><a href={prospect.website} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent-hover truncate">{prospect.website}</a></div>}
          {(prospect.city || prospect.state) && <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-pro-warm-gray" /><span className="text-pro-charcoal">{[prospect.city, prospect.state].filter(Boolean).join(', ')}</span></div>}
          {prospect.estimated_value != null && <div><span className="text-pro-warm-gray">Est. Value:</span> <span className="text-pro-charcoal font-medium">${prospect.estimated_value.toLocaleString()}</span></div>}
          {prospect.source && <div><span className="text-pro-warm-gray">Source:</span> <span className="text-pro-charcoal">{prospect.source}</span></div>}
          {prospect.next_follow_up && <div><span className="text-pro-warm-gray">Next follow-up:</span> <span className="text-signal-warn font-medium">{new Date(prospect.next_follow_up).toLocaleDateString()}</span></div>}
        </div>
        {prospect.notes && <p className="text-sm text-pro-warm-gray mt-3 border-t border-pro-stone/10 pt-3">{prospect.notes}</p>}
      </div>

      {/* Status Update + Invite */}
      <div className="bg-white rounded-xl border border-pro-stone/30 p-5">
        <h2 className="text-sm font-semibold text-pro-charcoal uppercase tracking-wider mb-3">Update Status</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {STATUS_OPTIONS.map(s => (
            <button key={s} onClick={() => handleStatusChange(s)} disabled={updatingStatus || prospect.status === s} className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${prospect.status === s ? 'bg-accent text-white border-accent' : 'border-pro-stone/30 text-pro-warm-gray hover:border-accent/30 disabled:opacity-50'}`}>
              {s.replace('_', ' ')}
            </button>
          ))}
        </div>
        {!prospect.invited_to_platform ? (
          <button onClick={handleInvite} className="inline-flex items-center gap-2 h-9 px-4 bg-signal-up/10 text-signal-up text-sm font-medium rounded-full hover:bg-signal-up/20 transition-colors">
            <Send className="w-4 h-4" /> Invite to Platform
          </button>
        ) : (
          <div className="flex items-center gap-2 text-sm text-signal-up">
            <Send className="w-4 h-4" />
            <span>Invited on {prospect.invited_at ? new Date(prospect.invited_at).toLocaleDateString() : 'N/A'}</span>
          </div>
        )}
      </div>

      {/* Touchpoints Timeline */}
      <div className="bg-white rounded-xl border border-pro-stone/30 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-pro-charcoal uppercase tracking-wider">Touchpoint Timeline</h2>
          <button onClick={() => setShowAddTp(s => !s)} className="h-8 px-3 bg-accent/10 text-accent text-xs font-medium rounded-lg hover:bg-accent/20 transition-colors inline-flex items-center gap-1">
            <Plus className="w-3 h-3" /> Add
          </button>
        </div>

        {showAddTp && (
          <div className="mb-4 p-4 bg-pro-ivory rounded-lg border border-pro-stone/20 space-y-3">
            <div className="flex flex-wrap gap-2">
              {TOUCHPOINT_TYPES.map(t => (
                <button key={t} onClick={() => setTpForm(f => ({ ...f, type: t }))} className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${tpForm.type === t ? 'bg-accent text-white border-accent' : 'border-pro-stone/30 text-pro-warm-gray hover:border-accent/30'}`}>
                  {t}
                </button>
              ))}
            </div>
            <input type="text" value={tpForm.subject} onChange={e => setTpForm(f => ({ ...f, subject: e.target.value }))} placeholder="Subject" className="w-full h-9 px-3 border border-pro-stone/30 rounded-lg text-sm text-pro-charcoal placeholder:text-pro-warm-gray focus:outline-none focus:border-accent/50" />
            <textarea value={tpForm.notes} onChange={e => setTpForm(f => ({ ...f, notes: e.target.value }))} placeholder="Notes..." rows={2} className="w-full px-3 py-2 border border-pro-stone/30 rounded-lg text-sm text-pro-charcoal placeholder:text-pro-warm-gray focus:outline-none focus:border-accent/50 resize-none" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAddTp(false)} className="text-xs text-pro-warm-gray">Cancel</button>
              <button onClick={handleAddTouchpoint} disabled={saving} className="h-8 px-4 bg-mn-dark text-white text-xs font-medium rounded-full hover:bg-mn-dark/90 disabled:opacity-50">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        )}

        {touchpoints.length === 0 ? (
          <p className="text-sm text-pro-warm-gray py-4">No touchpoints yet</p>
        ) : (
          <div className="space-y-3">
            {touchpoints.map(tp => (
              <div key={tp.id} className="flex items-start gap-3 py-3 border-b border-pro-stone/10 last:border-0">
                <div className="mt-0.5 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-4 h-4 text-accent" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-accent uppercase">{tp.type}</span>
                    <span className="text-xs text-pro-warm-gray">{new Date(tp.occurred_at).toLocaleString()}</span>
                  </div>
                  {tp.subject && <p className="text-sm font-medium text-pro-charcoal mt-0.5">{tp.subject}</p>}
                  {tp.notes && <p className="text-sm text-pro-warm-gray mt-1">{tp.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
