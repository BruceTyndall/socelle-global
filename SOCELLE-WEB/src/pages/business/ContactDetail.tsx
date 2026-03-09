import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Tag, Plus, Phone, Mail, Calendar, FileText, Users, X, Shield, Droplets, Scissors, AlertTriangle, Pencil, Zap, TrendingUp, Sparkles, StickyNote } from 'lucide-react';
import { useCrmContactDetail, useCrmInteractions, type NewInteraction } from '../../lib/useCrmContacts';
import { useAppointments } from '../../lib/useBooking';
import { useClientTreatmentRecords } from '../../lib/useClientRecords';
import { useAuth } from '../../lib/auth';
import { useCrmTasksForContact } from '../../lib/useCrmTasks';
import { supabase } from '../../lib/supabase';

interface RelevantSignal {
  id: string;
  title: string;
  description: string;
  magnitude: number;
  direction: string;
  category: string | null;
  updated_at: string;
}

const TABS = ['Overview', 'Interactions', 'Appointments', 'Service Records', 'Preferences', 'Intelligence'] as const;
type Tab = typeof TABS[number];

const INTERACTION_ICONS: Record<string, typeof Phone> = { call: Phone, email: Mail, meeting: Users, note: FileText };
const INTERACTION_TYPES = ['call', 'email', 'meeting', 'note'];

export default function ContactDetail() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const businessId = profile?.business_id;
  const { contact, tags, loading, isLive, addTag, removeTag } = useCrmContactDetail(id);
  const { interactions, addInteraction } = useCrmInteractions(id);
  const { appointments } = useAppointments(businessId);
  const { records } = useClientTreatmentRecords(id);
  const { tasks: contactTasks } = useCrmTasksForContact(id);

  const [tab, setTab] = useState<Tab>('Overview');
  const [tagInput, setTagInput] = useState('');
  const [showAddInteraction, setShowAddInteraction] = useState(false);
  const [newIx, setNewIx] = useState({ type: 'note', subject: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  const contactAppts = useMemo(() =>
    appointments.filter(a => a.contact_id === id), [appointments, id]
  );
  const upcomingAppts = contactAppts.filter(a => new Date(a.start_time) > new Date());
  const pastAppts = contactAppts.filter(a => new Date(a.start_time) <= new Date());

  const handleAddTag = async () => {
    if (!tagInput.trim()) return;
    await addTag(tagInput.trim());
    setTagInput('');
  };

  const handleAddInteraction = async () => {
    if (!id || !businessId) return;
    setSubmitting(true);
    try {
      const payload: NewInteraction = {
        contact_id: id,
        business_id: businessId,
        type: newIx.type,
        subject: newIx.subject || undefined,
        notes: newIx.notes || undefined,
      };
      await addInteraction(payload);
      setNewIx({ type: 'note', subject: '', notes: '' });
      setShowAddInteraction(false);
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Relevant signals for Intelligence tab ────────────────────────── */
  const treatmentCategories = useMemo(() => {
    const cats = new Set<string>();
    records.forEach(r => {
      if (r.service_name) cats.add(r.service_name.toLowerCase());
    });
    return Array.from(cats);
  }, [records]);

  const { data: relevantSignals = [], isLoading: signalsLoading } = useQuery({
    queryKey: ['crm_contact_signals', id, treatmentCategories],
    queryFn: async () => {
      if (treatmentCategories.length === 0) {
        // fallback: just get top signals by magnitude
        const { data, error } = await supabase
          .from('market_signals')
          .select('id, title, description, magnitude, direction, category, updated_at')
          .order('magnitude', { ascending: false })
          .limit(5);
        if (error) throw new Error(error.message);
        return (data ?? []) as RelevantSignal[];
      }
      // Try to match signals whose category or title overlaps with treatment history
      const { data, error } = await supabase
        .from('market_signals')
        .select('id, title, description, magnitude, direction, category, updated_at')
        .order('magnitude', { ascending: false })
        .limit(20);
      if (error) throw new Error(error.message);
      const rows = (data ?? []) as RelevantSignal[];
      // Client-side filter: match category or title keywords with treatment history
      const matched = rows.filter(s => {
        const cat = (s.category ?? '').toLowerCase();
        const title = s.title.toLowerCase();
        return treatmentCategories.some(tc => cat.includes(tc) || title.includes(tc));
      });
      return matched.length > 0 ? matched.slice(0, 5) : rows.slice(0, 5);
    },
    enabled: !!id && tab === 'Intelligence',
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-graphite/10 rounded w-48 animate-pulse" />
        <div className="bg-white rounded-xl border border-graphite/5 p-6 animate-pulse space-y-3">
          <div className="h-4 bg-graphite/10 rounded w-3/4" />
          <div className="h-4 bg-graphite/10 rounded w-1/2" />
          <div className="h-16 bg-graphite/10 rounded" />
        </div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="text-center py-12">
        <p className="text-graphite/60">Contact not found</p>
        <Link to="/portal/crm/contacts" className="text-accent text-sm mt-2 inline-block">Back to contacts</Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/portal/crm/contacts" className="w-8 h-8 rounded-full border border-accent-soft/30 flex items-center justify-center hover:border-accent/30 transition-colors">
          <ArrowLeft className="w-4 h-4 text-graphite/60" />
        </Link>
        <div className="flex items-center gap-3 flex-1">
          {contact.avatar_url ? (
            <img src={contact.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-lg font-semibold text-accent">
              {contact.first_name[0]}{contact.last_name[0]}
            </div>
          )}
          <div>
            <h1 className="text-xl font-semibold text-graphite">{contact.first_name} {contact.last_name}</h1>
            <p className="text-sm text-graphite/60">{contact.type} &middot; {contact.lifecycle_stage}</p>
          </div>
        </div>
        {!isLive && (
          <span className="text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-full">DEMO</span>
        )}
        <Link to={`/portal/crm/contacts/${id}/edit`} className="h-9 px-4 text-accent text-sm font-medium rounded-full border border-accent/30 hover:bg-accent/5 transition-colors inline-flex items-center gap-2">
          <Pencil className="w-4 h-4" /> Edit
        </Link>
        <Link to={`/portal/crm/contacts/${id}/records/new`} className="h-9 px-4 bg-mn-dark text-white text-sm font-medium rounded-full hover:bg-mn-dark/90 transition-colors inline-flex items-center gap-2">
          <Plus className="w-4 h-4" /> Service Record
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-accent-soft/20">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-accent text-accent' : 'border-transparent text-graphite/60 hover:text-graphite'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === 'Overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-accent-soft/30 p-5 space-y-4">
            <h2 className="text-sm font-semibold text-graphite uppercase tracking-wider">Contact Info</h2>
            <div className="space-y-3 text-sm">
              {contact.email && <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-graphite/60" /><span className="text-graphite">{contact.email}</span></div>}
              {contact.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-graphite/60" /><span className="text-graphite">{contact.phone}</span></div>}
              {contact.source && <div><span className="text-graphite/60">Source:</span> <span className="text-graphite">{contact.source}</span></div>}
              {contact.notes && <div><span className="text-graphite/60">Notes:</span> <span className="text-graphite">{contact.notes}</span></div>}
              <div><span className="text-graphite/60">Total visits:</span> <span className="text-graphite">{contact.total_visits}</span></div>
              <div><span className="text-graphite/60">Total spend:</span> <span className="text-graphite">${contact.total_spend.toFixed(2)}</span></div>
              {contact.last_visit_date && <div><span className="text-graphite/60">Last visit:</span> <span className="text-graphite">{new Date(contact.last_visit_date).toLocaleDateString()}</span></div>}
            </div>
          </div>

          <div className="space-y-5">
            {/* Tags */}
            <div className="bg-white rounded-xl border border-accent-soft/30 p-5">
              <h2 className="text-sm font-semibold text-graphite uppercase tracking-wider mb-3">Tags</h2>
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.map(t => (
                  <span key={t.id} className="inline-flex items-center gap-1 px-2.5 py-1 bg-accent/10 text-accent text-xs rounded-full">
                    <Tag className="w-3 h-3" /> {t.tag}
                    <button onClick={() => removeTag(t.id)} className="hover:text-accent-hover"><X className="w-3 h-3" /></button>
                  </span>
                ))}
                {tags.length === 0 && <span className="text-xs text-graphite/60">No tags</span>}
              </div>
              <div className="flex gap-2">
                <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddTag()} placeholder="Add tag..." className="flex-1 h-8 px-3 border border-accent-soft/30 rounded-lg text-sm text-graphite placeholder:text-graphite/60 focus:outline-none focus:border-accent/50" />
                <button onClick={handleAddTag} className="h-8 px-3 bg-accent/10 text-accent text-xs font-medium rounded-lg hover:bg-accent/20 transition-colors">Add</button>
              </div>
            </div>

            {/* GDPR */}
            <div className="bg-white rounded-xl border border-accent-soft/30 p-5">
              <h2 className="text-sm font-semibold text-graphite uppercase tracking-wider mb-3 flex items-center gap-2"><Shield className="w-4 h-4" /> GDPR Consent</h2>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${contact.gdpr_consent ? 'bg-signal-up' : 'bg-signal-down'}`} />
                <span className="text-sm text-graphite">{contact.gdpr_consent ? 'Consent given' : 'No consent'}</span>
                {contact.gdpr_consent_date && <span className="text-xs text-graphite/60">({new Date(contact.gdpr_consent_date).toLocaleDateString()})</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'Interactions' && (
        <div className="bg-white rounded-xl border border-accent-soft/30 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-graphite uppercase tracking-wider">Interaction Timeline</h2>
            <button onClick={() => setShowAddInteraction(s => !s)} className="h-8 px-3 bg-accent/10 text-accent text-xs font-medium rounded-lg hover:bg-accent/20 transition-colors inline-flex items-center gap-1">
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>

          {showAddInteraction && (
            <div className="mb-4 p-4 bg-background rounded-lg border border-accent-soft/20 space-y-3">
              <div className="flex gap-2">
                {INTERACTION_TYPES.map(t => (
                  <button key={t} onClick={() => setNewIx(p => ({ ...p, type: t }))} className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${newIx.type === t ? 'bg-accent text-white border-accent' : 'border-accent-soft/30 text-graphite/60 hover:border-accent/30'}`}>
                    {t}
                  </button>
                ))}
              </div>
              <input type="text" value={newIx.subject} onChange={e => setNewIx(p => ({ ...p, subject: e.target.value }))} placeholder="Subject" className="w-full h-9 px-3 border border-accent-soft/30 rounded-lg text-sm text-graphite placeholder:text-graphite/60 focus:outline-none focus:border-accent/50" />
              <textarea value={newIx.notes} onChange={e => setNewIx(p => ({ ...p, notes: e.target.value }))} placeholder="Notes..." rows={3} className="w-full px-3 py-2 border border-accent-soft/30 rounded-lg text-sm text-graphite placeholder:text-graphite/60 focus:outline-none focus:border-accent/50 resize-none" />
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowAddInteraction(false)} className="h-8 px-4 text-xs text-graphite/60 hover:text-graphite">Cancel</button>
                <button onClick={handleAddInteraction} disabled={submitting} className="h-8 px-4 bg-mn-dark text-white text-xs font-medium rounded-full hover:bg-mn-dark/90 disabled:opacity-50">
                  {submitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          )}

          {interactions.length === 0 ? (
            <p className="text-sm text-graphite/60 py-4">No interactions yet</p>
          ) : (
            <div className="space-y-3">
              {interactions.map(ix => {
                const Icon = INTERACTION_ICONS[ix.type] ?? FileText;
                return (
                  <div key={ix.id} className="flex items-start gap-3 py-3 border-b border-accent-soft/10 last:border-0">
                    <div className="mt-0.5 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-accent" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-accent uppercase">{ix.type}</span>
                        <span className="text-xs text-graphite/60">{new Date(ix.occurred_at).toLocaleString()}</span>
                      </div>
                      {ix.subject && <p className="text-sm font-medium text-graphite mt-0.5">{ix.subject}</p>}
                      {ix.notes && <p className="text-sm text-graphite/60 mt-1">{ix.notes}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'Appointments' && (
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-accent-soft/30 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-graphite uppercase tracking-wider">Upcoming</h2>
              <Link to="/portal/booking/calendar" className="text-xs text-accent hover:text-accent-hover font-medium">Book Appointment</Link>
            </div>
            {upcomingAppts.length === 0 ? (
              <p className="text-sm text-graphite/60">No upcoming appointments</p>
            ) : (
              <div className="space-y-2">
                {upcomingAppts.map(a => (
                  <Link key={a.id} to={`/portal/booking/appointments/${a.id}`} className="block p-3 rounded-lg border border-accent-soft/20 hover:border-accent/30 transition-colors">
                    <p className="text-sm font-medium text-graphite">{a.service_name ?? 'Service'}</p>
                    <p className="text-xs text-graphite/60">{new Date(a.start_time).toLocaleString()}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="bg-white rounded-xl border border-accent-soft/30 p-5">
            <h2 className="text-sm font-semibold text-graphite uppercase tracking-wider mb-4">Past</h2>
            {pastAppts.length === 0 ? (
              <p className="text-sm text-graphite/60">No past appointments</p>
            ) : (
              <div className="space-y-2">
                {pastAppts.map(a => (
                  <Link key={a.id} to={`/portal/booking/appointments/${a.id}`} className="block p-3 rounded-lg border border-accent-soft/20 hover:border-accent/30 transition-colors">
                    <p className="text-sm font-medium text-graphite">{a.service_name ?? 'Service'} <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${a.status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-accent-soft/20 text-graphite/60'}`}>{a.status}</span></p>
                    <p className="text-xs text-graphite/60">{new Date(a.start_time).toLocaleString()}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'Service Records' && (
        <div className="bg-white rounded-xl border border-accent-soft/30 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-graphite uppercase tracking-wider">Treatment Records</h2>
            <Link to={`/portal/crm/contacts/${id}/records/new`} className="h-8 px-3 bg-accent/10 text-accent text-xs font-medium rounded-lg hover:bg-accent/20 transition-colors inline-flex items-center gap-1">
              <Plus className="w-3 h-3" /> Add Record
            </Link>
          </div>
          {records.length === 0 ? (
            <p className="text-sm text-graphite/60 py-4">No service records yet</p>
          ) : (
            <div className="space-y-3">
              {records.map(r => (
                <div key={r.id} className="p-4 rounded-lg border border-accent-soft/20">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-graphite">{r.service_name}</p>
                      <p className="text-xs text-graphite/60">{new Date(r.performed_at).toLocaleDateString()}{r.performed_by ? ` · ${r.performed_by}` : ''}</p>
                    </div>
                    {r.follow_up_date && (
                      <span className="text-[10px] bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-full">
                        Follow-up: {new Date(r.follow_up_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {r.notes && <p className="text-sm text-graphite/60 mt-2">{r.notes}</p>}
                  {r.formula && <p className="text-xs text-accent mt-1">Formula: {r.formula}</p>}
                  {(r.before_photo_url || r.after_photo_url) && (
                    <div className="flex gap-3 mt-3">
                      {r.before_photo_url && <div><p className="text-[10px] text-graphite/60 mb-1">Before</p><img src={r.before_photo_url} alt="Before" className="w-24 h-24 object-cover rounded-lg border border-accent-soft/20" /></div>}
                      {r.after_photo_url && <div><p className="text-[10px] text-graphite/60 mb-1">After</p><img src={r.after_photo_url} alt="After" className="w-24 h-24 object-cover rounded-lg border border-accent-soft/20" /></div>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'Preferences' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-accent-soft/30 p-5">
            <h2 className="text-sm font-semibold text-graphite uppercase tracking-wider mb-3 flex items-center gap-2"><Droplets className="w-4 h-4" /> Skin Type</h2>
            <p className="text-sm text-graphite">{contact.skin_type ?? 'Not specified'}</p>
          </div>
          <div className="bg-white rounded-xl border border-accent-soft/30 p-5">
            <h2 className="text-sm font-semibold text-graphite uppercase tracking-wider mb-3 flex items-center gap-2"><Scissors className="w-4 h-4" /> Hair Type</h2>
            <p className="text-sm text-graphite">{contact.hair_type ?? 'Not specified'}</p>
          </div>
          <div className="bg-white rounded-xl border border-accent-soft/30 p-5">
            <h2 className="text-sm font-semibold text-graphite uppercase tracking-wider mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Allergies</h2>
            {contact.allergies && contact.allergies.length > 0 ? (
              <div className="flex flex-wrap gap-2">{contact.allergies.map((a, i) => <span key={i} className="px-2.5 py-1 bg-signal-down/10 text-signal-down text-xs rounded-full">{a}</span>)}</div>
            ) : (
              <p className="text-sm text-graphite/60">None reported</p>
            )}
          </div>
          <div className="bg-white rounded-xl border border-accent-soft/30 p-5">
            <h2 className="text-sm font-semibold text-graphite uppercase tracking-wider mb-3 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Sensitivities</h2>
            {contact.sensitivities && contact.sensitivities.length > 0 ? (
              <div className="flex flex-wrap gap-2">{contact.sensitivities.map((s, i) => <span key={i} className="px-2.5 py-1 bg-signal-warn/10 text-signal-warn text-xs rounded-full">{s}</span>)}</div>
            ) : (
              <p className="text-sm text-graphite/60">None reported</p>
            )}
          </div>
        </div>
      )}

      {tab === 'Intelligence' && (
        <div className="space-y-5">
          {/* Intelligence Summary */}
          <div className="bg-white rounded-xl border border-accent/20 p-5">
            <h2 className="text-sm font-semibold text-graphite uppercase tracking-wider mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-accent" /> Intelligence Insights
            </h2>
            <div className="bg-accent-soft/50 border border-accent/10 rounded-lg p-4">
              <p className="text-sm text-accent font-medium mb-1">Contact Intelligence Summary</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-graphite mt-3">
                <div>
                  <p className="text-graphite/50">Total Visits</p>
                  <p className="text-lg font-semibold">{contact.total_visits}</p>
                </div>
                <div>
                  <p className="text-graphite/50">Total Spend</p>
                  <p className="text-lg font-semibold">${contact.total_spend.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-graphite/50">Lifecycle</p>
                  <p className="text-lg font-semibold capitalize">{contact.lifecycle_stage}</p>
                </div>
                <div>
                  <p className="text-graphite/50">Last Visit</p>
                  <p className="text-lg font-semibold">{contact.last_visit_date ? new Date(contact.last_visit_date).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Relevant Market Signals */}
          <div className="bg-white rounded-xl border border-accent/20 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-graphite uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent" /> Relevant Market Signals
              </h2>
              <Link to="/portal/intelligence" className="text-xs text-accent hover:text-accent-hover font-medium">View All Signals</Link>
            </div>
            {signalsLoading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="space-y-2">
                    <div className="h-3 bg-graphite/10 rounded w-3/4" />
                    <div className="h-3 bg-graphite/10 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : relevantSignals.length === 0 ? (
              <p className="text-sm text-graphite/50 py-4">No relevant signals found. Add treatment records to see matched intelligence.</p>
            ) : (
              <div className="space-y-3">
                {relevantSignals.map(signal => (
                  <div key={signal.id} className="p-3 rounded-lg bg-accent-soft/30 border border-accent/10">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className={`w-3.5 h-3.5 flex-shrink-0 ${signal.direction === 'up' ? 'text-signal-up' : signal.direction === 'down' ? 'text-signal-down' : 'text-signal-warn'}`} />
                          <span className="text-[10px] text-graphite/40 uppercase">{signal.category ?? 'Market'}</span>
                          <span className="text-[10px] text-graphite/30">{new Date(signal.updated_at).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm font-medium text-graphite">{signal.title}</p>
                        <p className="text-xs text-graphite/60 mt-0.5 line-clamp-2">{signal.description}</p>
                      </div>
                      <span className="text-xs font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full flex-shrink-0">
                        {signal.magnitude}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button className="inline-flex items-center gap-1 text-[10px] font-medium text-accent bg-accent/10 px-2 py-1 rounded-full hover:bg-accent/20 transition-colors">
                        <Sparkles className="w-3 h-3" /> Create personalized offer
                      </button>
                      <button className="inline-flex items-center gap-1 text-[10px] font-medium text-graphite/50 bg-graphite/5 px-2 py-1 rounded-full hover:bg-graphite/10 transition-colors">
                        <StickyNote className="w-3 h-3" /> Add signal to note
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Open Tasks for this Contact */}
          <div className="bg-white rounded-xl border border-graphite/5 p-5">
            <h2 className="text-sm font-semibold text-graphite uppercase tracking-wider mb-3">Open Tasks</h2>
            {contactTasks.filter(t => t.status !== 'completed').length === 0 ? (
              <p className="text-sm text-graphite/50 py-2">No open tasks for this contact</p>
            ) : (
              <div className="space-y-2">
                {contactTasks.filter(t => t.status !== 'completed').map(task => (
                  <div key={task.id} className="flex items-center gap-3 py-2 border-b border-graphite/5 last:border-0">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${task.priority === 'high' ? 'bg-signal-down' : task.priority === 'medium' ? 'bg-signal-warn' : 'bg-accent'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-graphite truncate">{task.title}</p>
                      {task.due_date && (
                        <p className="text-xs text-graphite/50">Due: {new Date(task.due_date).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Treatment History Intelligence */}
          <div className="bg-white rounded-xl border border-graphite/5 p-5">
            <h2 className="text-sm font-semibold text-graphite uppercase tracking-wider mb-3">Treatment History Intelligence</h2>
            {records.length === 0 ? (
              <p className="text-sm text-graphite/50 py-2">No treatment records to analyze</p>
            ) : (
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="bg-accent-soft/50 rounded-lg p-3">
                  <p className="text-graphite/50">Total Treatments</p>
                  <p className="text-xl font-semibold text-graphite">{records.length}</p>
                </div>
                <div className="bg-accent-soft/50 rounded-lg p-3">
                  <p className="text-graphite/50">Follow-ups Due</p>
                  <p className="text-xl font-semibold text-graphite">
                    {records.filter(r => r.follow_up_date && new Date(r.follow_up_date) > new Date()).length}
                  </p>
                </div>
                <div className="bg-accent-soft/50 rounded-lg p-3">
                  <p className="text-graphite/50">Last Treatment</p>
                  <p className="text-sm font-semibold text-graphite">
                    {records[0] ? new Date(records[0].performed_at).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
