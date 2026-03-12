import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  ArrowLeft,
  Tag,
  Plus,
  Phone,
  Mail,
  Calendar,
  FileText,
  Users,
  X,
  Shield,
  Droplets,
  Scissors,
  AlertTriangle,
  Pencil,
  Zap,
  TrendingUp,
  Sparkles,
  StickyNote,
  Globe,
  ShoppingBag,
  RefreshCw,
  Link2,
  CheckCircle,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { useCrmContactDetail, useCrmInteractions, type NewInteraction } from '../../lib/useCrmContacts';
import { useAppointments } from '../../lib/useBooking';
import { useClientTreatmentRecords } from '../../lib/useClientRecords';
import { useAuth } from '../../lib/auth';
import { useCrmTasks, useCrmTasksForContact } from '../../lib/useCrmTasks';
import { useCrmPurchaseHistory, type ContactPurchase } from '../../lib/useCrmPurchaseHistory';
import { supabase } from '../../lib/supabase';
import { exportToCsv } from '../../lib/csvExport';
import { useIntelligence } from '../../lib/intelligence/useIntelligence';

interface RelevantSignal {
  id: string;
  title: string;
  description: string;
  magnitude: number;
  direction: string;
  category: string | null;
  updated_at: string;
}

const TABS = [
  'Timeline',
  'Overview',
  'Interactions',
  'Appointments',
  'Service Records',
  'Purchases',
  'Preferences',
  'Intelligence',
] as const;
type Tab = typeof TABS[number];

const INTERACTION_ICONS: Record<string, typeof Phone> = { call: Phone, email: Mail, meeting: Users, note: FileText };
const INTERACTION_TYPES = ['call', 'email', 'meeting', 'note'];
type TimelineSource = 'interaction' | 'appointment' | 'purchase' | 'task' | 'service_record' | 'signal_attribution';

interface UnifiedTimelineEntry {
  id: string;
  source: TimelineSource;
  occurredAt: string;
  title: string;
  subtitle: string;
  status: string;
  href: string | null;
}

const TIMELINE_SOURCE_META: Record<TimelineSource, { label: string; chip: string }> = {
  interaction: { label: 'Interaction', chip: 'bg-accent/10 text-accent' },
  appointment: { label: 'Booking', chip: 'bg-signal-up/10 text-signal-up' },
  purchase: { label: 'Purchase', chip: 'bg-signal-warn/10 text-signal-warn' },
  task: { label: 'Task', chip: 'bg-graphite/10 text-graphite/70' },
  service_record: { label: 'Service Record', chip: 'bg-mn-dark/10 text-mn-dark' },
  signal_attribution: { label: 'Signal Attribution', chip: 'bg-indigo-100 text-indigo-700' },
};

export default function ContactDetail() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const businessId = profile?.business_id;
  const queryClient = useQueryClient();
  const { contact, tags, loading, isLive, addTag, removeTag } = useCrmContactDetail(id);
  const {
    interactions,
    addInteraction,
    loading: interactionsLoading,
    error: interactionsError,
  } = useCrmInteractions(id);
  const {
    appointments,
    loading: appointmentsLoading,
    error: appointmentsError,
  } = useAppointments(businessId);
  const {
    records,
    loading: recordsLoading,
    error: recordsError,
  } = useClientTreatmentRecords(id);
  const { tasks: contactTasks, loading: contactTasksLoading } = useCrmTasksForContact(id);
  const { createTask } = useCrmTasks(businessId);
  const {
    purchases,
    summary: purchaseSummary,
    loading: purchasesLoading,
    error: purchasesError,
    refetch: refetchPurchases,
  } = useCrmPurchaseHistory({
    contactId: id,
    businessId,
    email: contact?.email ?? null,
    phone: contact?.phone ?? null,
    metadata:
      contact?.metadata && typeof contact.metadata === 'object' && !Array.isArray(contact.metadata)
        ? (contact.metadata as Record<string, unknown>)
        : null,
  });

  const [tab, setTab] = useState<Tab>('Overview');
  const [tagInput, setTagInput] = useState('');
  const [showAddInteraction, setShowAddInteraction] = useState(false);
  const [newIx, setNewIx] = useState({ type: 'note', subject: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [purchaseActionId, setPurchaseActionId] = useState<string | null>(null);
  const [purchaseActionNotice, setPurchaseActionNotice] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [timelineFilter, setTimelineFilter] = useState<'all' | TimelineSource>('all');

  // ── CRM-WO-07: Link Signal modal state ─────────────────────────────────
  const [showLinkSignal, setShowLinkSignal] = useState(false);
  const [signalSearch, setSignalSearch] = useState('');
  const [linkingSignalId, setLinkingSignalId] = useState<string | null>(null);
  const [linkSuccess, setLinkSuccess] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);

  // ── CRM-WO-09: Schedule follow-up modal state ───────────────────────────
  const [showScheduleFollowUp, setShowScheduleFollowUp] = useState(false);
  const [followUpTask, setFollowUpTask] = useState({ title: '', due_date: '', notes: '' });
  const [scheduleSubmitting, setScheduleSubmitting] = useState(false);

  const contactAppts = useMemo(() =>
    appointments.filter(a => a.contact_id === id), [appointments, id]
  );
  const upcomingAppts = contactAppts.filter(a => new Date(a.start_time) > new Date());
  const pastAppts = contactAppts.filter(a => new Date(a.start_time) <= new Date());
  const contactChannels = useMemo(() => {
    const metadata =
      contact?.metadata && typeof contact.metadata === 'object' && !Array.isArray(contact.metadata)
        ? (contact.metadata as Record<string, unknown>)
        : {};
    const channels =
      metadata.contact_channels &&
      typeof metadata.contact_channels === 'object' &&
      !Array.isArray(metadata.contact_channels)
        ? (metadata.contact_channels as Record<string, unknown>)
        : {};
    return {
      website_url: typeof channels.website_url === 'string' ? channels.website_url : '',
      instagram_handle: typeof channels.instagram_handle === 'string' ? channels.instagram_handle : '',
      facebook_handle: typeof channels.facebook_handle === 'string' ? channels.facebook_handle : '',
      tiktok_handle: typeof channels.tiktok_handle === 'string' ? channels.tiktok_handle : '',
      linkedin_url: typeof channels.linkedin_url === 'string' ? channels.linkedin_url : '',
    };
  }, [contact?.metadata]);

  const timelineEntries = useMemo(() => {
    const entries: UnifiedTimelineEntry[] = [];

    interactions.forEach((interaction) => {
      entries.push({
        id: `interaction-${interaction.id}`,
        source: interaction.type === 'signal_link' ? 'signal_attribution' : 'interaction',
        occurredAt: interaction.occurred_at,
        title: interaction.subject || `${interaction.type} logged`,
        subtitle: interaction.notes || 'CRM interaction captured',
        status: interaction.type,
        href: null,
      });
    });

    contactAppts.forEach((appointment) => {
      entries.push({
        id: `appointment-${appointment.id}`,
        source: 'appointment',
        occurredAt: appointment.start_time,
        title: appointment.service_name || 'Appointment',
        subtitle:
          [appointment.staff_first_name, appointment.staff_last_name]
            .filter(Boolean)
            .join(' ')
            .trim() || 'Booking hub',
        status: appointment.status,
        href: `/portal/booking/appointments/${appointment.id}`,
      });
    });

    records.forEach((record) => {
      entries.push({
        id: `record-${record.id}`,
        source: 'service_record',
        occurredAt: record.performed_at,
        title: record.service_name,
        subtitle: record.notes || 'Service record added',
        status: 'recorded',
        href: null,
      });
    });

    contactTasks.forEach((task) => {
      entries.push({
        id: `task-${task.id}`,
        source: 'task',
        occurredAt: task.due_date ? `${task.due_date}T09:00:00.000Z` : task.updated_at,
        title: task.title,
        subtitle: task.description || 'Follow-up task',
        status: task.status,
        href: '/portal/crm/tasks',
      });
    });

    purchases.forEach((purchase) => {
      entries.push({
        id: `purchase-${purchase.id}`,
        source: 'purchase',
        occurredAt: purchase.placed_at,
        title: purchase.order_number,
        subtitle: `${purchase.item_count} items · $${(purchase.total_cents / 100).toFixed(2)}`,
        status: purchase.status,
        href: `/portal/orders/${purchase.id}`,
      });
    });

    return entries.sort(
      (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
    );
  }, [contactAppts, contactTasks, interactions, purchases, records]);

  const filteredTimelineEntries = useMemo(
    () =>
      timelineFilter === 'all'
        ? timelineEntries
        : timelineEntries.filter((entry) => entry.source === timelineFilter),
    [timelineEntries, timelineFilter],
  );

  const timelineLoading =
    interactionsLoading || appointmentsLoading || recordsLoading || contactTasksLoading || purchasesLoading;
  const timelineError = interactionsError || appointmentsError || recordsError || purchasesError || null;

  const handleExportTimeline = () => {
    exportToCsv(
      filteredTimelineEntries.map((entry) => ({
        source: entry.source,
        occurred_at: entry.occurredAt,
        title: entry.title,
        subtitle: entry.subtitle,
        status: entry.status,
      })),
      `crm_contact_timeline_${id ?? 'contact'}`,
    );
  };

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

  const handleCreatePurchaseFollowUpTask = async (purchase: ContactPurchase) => {
    if (!businessId || !id) return;
    setPurchaseActionId(purchase.id);
    setPurchaseActionNotice(null);
    try {
      const followUpDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);
      await createTask({
        business_id: businessId,
        contact_id: id,
        title: `Follow up on ${purchase.order_number}`,
        description: `Order status: ${purchase.status}. Total: $${(purchase.total_cents / 100).toFixed(2)}. Review reorder and cross-sell opportunities.`,
        due_date: followUpDate,
        priority: 'medium',
        status: 'open',
      });
      setPurchaseActionNotice({
        type: 'success',
        text: `Follow-up task created for ${purchase.order_number}.`,
      });
    } catch (error) {
      setPurchaseActionNotice({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to create follow-up task.',
      });
    } finally {
      setPurchaseActionId(null);
    }
  };

  const handleAddPurchaseNote = async (purchase: ContactPurchase) => {
    if (!id || !businessId) return;
    setPurchaseActionId(purchase.id);
    setPurchaseActionNotice(null);
    try {
      const payload: NewInteraction = {
        contact_id: id,
        business_id: businessId,
        type: 'note',
        subject: `Purchase linked: ${purchase.order_number}`,
        notes: `Linked ecommerce purchase. Status: ${purchase.status}. Total: $${(purchase.total_cents / 100).toFixed(2)}.`,
      };
      await addInteraction(payload);
      setPurchaseActionNotice({
        type: 'success',
        text: `Purchase note added for ${purchase.order_number}.`,
      });
    } catch (error) {
      setPurchaseActionNotice({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to add purchase note.',
      });
    } finally {
      setPurchaseActionId(null);
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

  const { signals: allSignals, loading: signalsLoading } = useIntelligence({ limit: 50 });

  const relevantSignals = useMemo(() => {
    if (!id || tab !== 'Intelligence' || allSignals.length === 0) return [];
    if (treatmentCategories.length === 0) {
      return allSignals.slice(0, 5) as RelevantSignal[];
    }
    const matched = allSignals.filter(s => {
      const cat = (s.category ?? '').toLowerCase();
      const title = s.title.toLowerCase();
      return treatmentCategories.some(tc => cat.includes(tc) || title.includes(tc));
    });
    return (matched.length > 0 ? matched.slice(0, 5) : allSignals.slice(0, 5)) as RelevantSignal[];
  }, [allSignals, treatmentCategories, id, tab]);

  /* ── CRM-WO-07: Signal search for Link Signal modal ──────────────────── */
  const searchableSignals = useMemo(() => {
    if (!showLinkSignal) return [];
    return allSignals as RelevantSignal[];
  }, [allSignals, showLinkSignal]);

  const filteredSearchSignals = useMemo(() => {
    if (!signalSearch.trim()) return searchableSignals.slice(0, 10);
    const q = signalSearch.toLowerCase();
    return searchableSignals
      .filter(s => s.title.toLowerCase().includes(q) || (s.category ?? '').toLowerCase().includes(q))
      .slice(0, 10);
  }, [searchableSignals, signalSearch]);

  const handleLinkSignal = async (signal: RelevantSignal) => {
    if (!id || !businessId) return;
    setLinkingSignalId(signal.id);
    setLinkError(null);
    try {
      const payload: NewInteraction = {
        contact_id: id,
        business_id: businessId,
        type: 'signal_link',
        subject: signal.title,
        notes: `Market signal linked: ${signal.title}. Category: ${signal.category ?? 'General'}. Direction: ${signal.direction}.`,
      };
      await addInteraction(payload);
      // Invalidate interactions so Timeline updates
      await queryClient.invalidateQueries({ queryKey: ['crm_interactions', id] });
      setLinkSuccess(signal.title);
      setTimeout(() => {
        setLinkSuccess(null);
        setShowLinkSignal(false);
        setSignalSearch('');
        setLinkingSignalId(null);
      }, 1800);
    } catch (err) {
      setLinkError(err instanceof Error ? err.message : 'Failed to link signal.');
    } finally {
      if (!linkSuccess) setLinkingSignalId(null);
    }
  };

  /* ── CRM-WO-09: Days since last visit + schedule follow-up ───────────── */
  const daysSinceLastVisit = useMemo(() => {
    // Use last_visit_at (rebooking col) from contact if available, else fall back to last_visit_date or last appointment
    const lastVisitSource = (contact?.last_visit_at) ?? contact?.last_visit_date;
    if (!lastVisitSource) {
      // Fall back to latest appointment
      if (pastAppts.length > 0) {
        const latest = pastAppts.reduce((a, b) =>
          new Date(a.start_time) > new Date(b.start_time) ? a : b,
        );
        return Math.floor((Date.now() - new Date(latest.start_time).getTime()) / (1000 * 60 * 60 * 24));
      }
      return null;
    }
    return Math.floor((Date.now() - new Date(lastVisitSource).getTime()) / (1000 * 60 * 60 * 24));
  }, [contact, pastAppts]);

  const churnRiskScore: number = contact?.churn_risk_score ?? 0;

  const churnRiskColor = churnRiskScore <= 33
    ? 'text-signal-up'
    : churnRiskScore <= 66
    ? 'text-signal-warn'
    : 'text-signal-down';

  const churnRiskBg = churnRiskScore <= 33
    ? 'bg-signal-up'
    : churnRiskScore <= 66
    ? 'bg-signal-warn'
    : 'bg-signal-down';

  const handleScheduleFollowUp = async () => {
    if (!businessId || !id || !followUpTask.title) return;
    setScheduleSubmitting(true);
    try {
      await createTask({
        business_id: businessId,
        contact_id: id,
        title: followUpTask.title,
        description: followUpTask.notes || undefined,
        due_date: followUpTask.due_date || undefined,
        priority: churnRiskScore >= 67 ? 'high' : 'medium',
        status: 'open',
      });
      setShowScheduleFollowUp(false);
      setFollowUpTask({ title: '', due_date: '', notes: '' });
    } finally {
      setScheduleSubmitting(false);
    }
  };

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
      {tab === 'Timeline' && (
        <div className="bg-white rounded-xl border border-accent-soft/30 p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-graphite uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-accent" /> Unified CRM Timeline
              </h2>
              <p className="text-xs text-graphite/50 mt-1">
                Booking, commerce, service records, tasks, and interactions in one operational stream.
              </p>
            </div>
            <button
              onClick={handleExportTimeline}
              className="h-8 px-3 rounded-full border border-accent-soft/30 text-xs text-graphite/70 hover:border-accent/30 transition-colors"
            >
              Export CSV
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTimelineFilter('all')}
              className={`h-7 px-3 rounded-full text-xs font-medium border transition-colors ${
                timelineFilter === 'all'
                  ? 'bg-accent text-white border-accent'
                  : 'border-accent-soft/30 text-graphite/60 hover:border-accent/30'
              }`}
            >
              All
            </button>
            {(Object.keys(TIMELINE_SOURCE_META) as TimelineSource[]).map((source) => (
              <button
                key={source}
                onClick={() => setTimelineFilter(source)}
                className={`h-7 px-3 rounded-full text-xs font-medium border transition-colors ${
                  timelineFilter === source
                    ? 'bg-accent text-white border-accent'
                    : 'border-accent-soft/30 text-graphite/60 hover:border-accent/30'
                }`}
              >
                {TIMELINE_SOURCE_META[source].label}
              </button>
            ))}
            {/* CRM-POWER-01: Signal filter explicitly added if not in TIMELINE_SOURCE_META */}
            <button
                onClick={() => setTimelineFilter('signal_attribution' as any)}
                className={`h-7 px-3 rounded-full text-xs font-medium border transition-colors ${
                  timelineFilter === 'signal_attribution'
                    ? 'bg-accent text-white border-accent'
                    : 'border-accent-soft/30 text-graphite/60 hover:border-accent/30'
                }`}
              >
                Signal Attribution
            </button>
          </div>

          {/* CRM-POWER-01: Rebooking CTA & Churn Risk summary above timeline */}
          {churnRiskScore >= 67 && daysSinceLastVisit !== null && daysSinceLastVisit > 90 && (
             <div className="bg-signal-warn/10 border border-signal-warn/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
               <div>
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-signal-warn" />
                    <span className="text-sm font-semibold text-signal-warn uppercase tracking-wider">High Churn Risk</span>
                  </div>
                  <p className="text-xs text-graphite/70">Contact hasn't visited in {daysSinceLastVisit} days and has a risk score of {churnRiskScore}.</p>
               </div>
               <button onClick={() => setShowScheduleFollowUp(true)} className="h-9 px-4 shrink-0 bg-signal-warn text-white text-sm font-medium rounded-full hover:bg-signal-warn/90 transition-colors inline-flex items-center gap-2">
                 <RefreshCw className="w-4 h-4" /> Schedule Rebooking
               </button>
             </div>
          )}

          {timelineLoading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="p-3 rounded-lg border border-accent-soft/20 space-y-2">
                  <div className="h-3 bg-graphite/10 rounded w-48" />
                  <div className="h-3 bg-graphite/10 rounded w-72" />
                </div>
              ))}
            </div>
          ) : timelineError ? (
            <div className="rounded-lg border border-signal-down/20 bg-signal-down/5 p-3 text-sm text-signal-down">
              {timelineError}
            </div>
          ) : filteredTimelineEntries.length === 0 ? (
            <div className="rounded-lg border border-accent-soft/20 bg-background p-4 text-sm text-graphite/60">
              <p>No timeline events yet for this filter.</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => setTab('Interactions')}
                  className="h-8 px-3 rounded-full bg-accent/10 text-accent text-xs font-medium hover:bg-accent/20 transition-colors"
                >
                  Add Interaction
                </button>
                <Link
                  to="/portal/booking/calendar"
                  className="h-8 px-3 rounded-full border border-accent-soft/30 text-graphite/70 text-xs font-medium hover:border-accent/30 transition-colors inline-flex items-center"
                >
                  Create Appointment
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTimelineEntries.map((entry) => {
                const sourceMeta = entry.source === 'signal_attribution' 
                  ? { chip: 'bg-indigo-100 text-indigo-700', label: 'Signal Attribution' }
                  : TIMELINE_SOURCE_META[entry.source];
                  
                const content = (
                  <div className={`p-3 rounded-lg border transition-colors ${entry.source === 'signal_attribution' ? 'border-indigo-200 bg-indigo-50/40 hover:border-indigo-300' : 'border-accent-soft/20 hover:border-accent/30'}`}>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${sourceMeta.chip}`}>
                            {entry.source === 'signal_attribution' && <Sparkles className="w-3 h-3" />}
                            {sourceMeta.label}
                          </span>
                          <span className="text-[10px] text-graphite/40 uppercase">{entry.status}</span>
                        </div>
                        <p className="text-sm font-semibold text-graphite mt-1">{entry.title}</p>
                        <p className="text-xs text-graphite/60 mt-0.5">{entry.subtitle}</p>
                      </div>
                      <div className="text-xs text-graphite/50">
                        {new Date(entry.occurredAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                );

                if (!entry.href) {
                  return <div key={entry.id}>{content}</div>;
                }

                return (
                  <Link key={entry.id} to={entry.href}>
                    {content}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === 'Overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-xl border border-accent-soft/30 p-5 space-y-4">
            <div className="flex items-start justify-between">
               <h2 className="text-sm font-semibold text-graphite uppercase tracking-wider">Contact Info</h2>
               {/* CRM-POWER-01: Churn Risk Header Badge */}
               <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${churnRiskBg}/20 ${churnRiskColor} border border-${churnRiskColor}/20 flex items-center gap-1`}>
                 <Activity className="w-3 h-3" /> Risk: {churnRiskScore}
               </div>
            </div>
            <div className="space-y-3 text-sm">
              {contact.email && <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-graphite/60" /><span className="text-graphite">{contact.email}</span></div>}
              {contact.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-graphite/60" /><span className="text-graphite">{contact.phone}</span></div>}
              {contact.source && <div><span className="text-graphite/60">Source:</span> <span className="text-graphite">{contact.source}</span></div>}
              {contact.notes && <div><span className="text-graphite/60">Notes:</span> <span className="text-graphite">{contact.notes}</span></div>}
              <div><span className="text-graphite/60">Total visits:</span> <span className="text-graphite">{contact.total_visits}</span></div>
              <div><span className="text-graphite/60">Total spend:</span> <span className="text-graphite">${contact.total_spend.toFixed(2)}</span></div>
              {contact.last_visit_date && <div><span className="text-graphite/60">Last visit:</span> <span className="text-graphite">{new Date(contact.last_visit_date).toLocaleDateString()}</span></div>}
              {(contactChannels.website_url || contactChannels.instagram_handle || contactChannels.facebook_handle || contactChannels.tiktok_handle || contactChannels.linkedin_url) && (
                <div className="pt-2 border-t border-accent-soft/20 space-y-1.5">
                  <p className="text-graphite/60 text-xs uppercase tracking-wide">Website + Social</p>
                  {contactChannels.website_url && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-graphite/60" />
                      <a href={contactChannels.website_url} target="_blank" rel="noreferrer" className="text-accent hover:text-accent-hover break-all">
                        {contactChannels.website_url}
                      </a>
                    </div>
                  )}
                  {contactChannels.instagram_handle && (
                    <div><span className="text-graphite/60">Instagram:</span> <span className="text-graphite">{contactChannels.instagram_handle}</span></div>
                  )}
                  {contactChannels.facebook_handle && (
                    <div><span className="text-graphite/60">Facebook:</span> <span className="text-graphite">{contactChannels.facebook_handle}</span></div>
                  )}
                  {contactChannels.tiktok_handle && (
                    <div><span className="text-graphite/60">TikTok:</span> <span className="text-graphite">{contactChannels.tiktok_handle}</span></div>
                  )}
                  {contactChannels.linkedin_url && (
                    <div>
                      <span className="text-graphite/60">LinkedIn:</span>{' '}
                      <a href={contactChannels.linkedin_url} target="_blank" rel="noreferrer" className="text-accent hover:text-accent-hover break-all">
                        {contactChannels.linkedin_url}
                      </a>
                    </div>
                  )}
                </div>
              )}
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

      {tab === 'Purchases' && (
        <div className="space-y-5">
          {purchaseActionNotice && (
            <div
              className={`rounded-xl border px-4 py-3 text-sm ${
                purchaseActionNotice.type === 'success'
                  ? 'bg-signal-up/5 border-signal-up/20 text-signal-up'
                  : 'bg-signal-down/5 border-signal-down/20 text-signal-down'
              }`}
            >
              {purchaseActionNotice.text}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-accent-soft/30 p-4">
              <p className="text-xs uppercase tracking-wide text-graphite/50">Orders</p>
              <p className="text-2xl font-semibold text-graphite mt-1">
                {purchaseSummary.total_orders}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-accent-soft/30 p-4">
              <p className="text-xs uppercase tracking-wide text-graphite/50">Total Spend</p>
              <p className="text-2xl font-semibold text-graphite mt-1">
                ${(purchaseSummary.total_spent_cents / 100).toFixed(2)}
              </p>
            </div>
            <div className="bg-white rounded-xl border border-accent-soft/30 p-4">
              <p className="text-xs uppercase tracking-wide text-graphite/50">Last Purchase</p>
              <p className="text-sm font-semibold text-graphite mt-2">
                {purchaseSummary.last_purchase_at
                  ? new Date(purchaseSummary.last_purchase_at).toLocaleDateString()
                  : 'No purchases yet'}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-accent-soft/30 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-graphite uppercase tracking-wider flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-accent" /> Ecommerce Purchase History
              </h2>
              <button
                onClick={() => refetchPurchases()}
                className="text-xs text-accent hover:text-accent-hover font-medium inline-flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh
              </button>
            </div>

            {purchasesLoading ? (
              <div className="space-y-3 animate-pulse">
                {[1, 2, 3].map((index) => (
                  <div key={index} className="space-y-2">
                    <div className="h-3 bg-graphite/10 rounded w-48" />
                    <div className="h-3 bg-graphite/10 rounded w-72" />
                  </div>
                ))}
              </div>
            ) : purchasesError ? (
              <div className="bg-signal-down/5 border border-signal-down/20 rounded-lg p-4 text-sm text-signal-down">
                {purchasesError}
              </div>
            ) : purchases.length === 0 ? (
              <p className="text-sm text-graphite/50 py-4">
                No ecommerce purchases linked yet for this contact.
              </p>
            ) : (
              <div className="space-y-3">
                {purchases.map((purchase) => (
                  <div
                    key={purchase.id}
                    className="p-4 rounded-lg border border-accent-soft/20"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-graphite">
                          {purchase.order_number}
                        </p>
                        <p className="text-xs text-graphite/60">
                          {new Date(purchase.placed_at).toLocaleString()} ·{' '}
                          {purchase.item_count} item{purchase.item_count === 1 ? '' : 's'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-graphite">
                          ${(purchase.total_cents / 100).toFixed(2)}
                        </p>
                        <p className="text-[10px] uppercase tracking-wide text-graphite/50">
                          {purchase.status}
                        </p>
                      </div>
                    </div>

                    {purchase.items.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {purchase.items.slice(0, 4).map((item) => (
                          <span
                            key={item.id}
                            className="text-[10px] bg-accent-soft/20 text-graphite/70 px-2 py-0.5 rounded-full"
                          >
                            {item.product_name} × {item.quantity}
                          </span>
                        ))}
                        {purchase.items.length > 4 && (
                          <span className="text-[10px] text-graphite/50 px-1 py-0.5">
                            +{purchase.items.length - 4} more
                          </span>
                        )}
                      </div>
                    )}

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        onClick={() => handleCreatePurchaseFollowUpTask(purchase)}
                        disabled={purchaseActionId === purchase.id}
                        className="h-8 px-3 rounded-full bg-accent/10 text-accent text-xs font-medium hover:bg-accent/20 disabled:opacity-50 transition-colors"
                      >
                        {purchaseActionId === purchase.id ? 'Saving...' : 'Create follow-up task'}
                      </button>
                      <button
                        onClick={() => handleAddPurchaseNote(purchase)}
                        disabled={purchaseActionId === purchase.id}
                        className="h-8 px-3 rounded-full border border-accent-soft/30 text-graphite/70 text-xs font-medium hover:border-accent/30 disabled:opacity-50 transition-colors"
                      >
                        Add purchase note
                      </button>
                      <Link
                        to={`/portal/orders/${purchase.id}`}
                        className="h-8 px-3 rounded-full border border-accent-soft/30 text-graphite/70 text-xs font-medium hover:border-accent/30 transition-colors inline-flex items-center"
                      >
                        View order
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
          {/* ── CRM-WO-09: Rebooking Risk Panel ───────────────────────── */}
          <div className={`rounded-xl border p-5 ${churnRiskScore >= 67 ? 'border-signal-down/30 bg-signal-down/5' : churnRiskScore >= 34 ? 'border-signal-warn/30 bg-signal-warn/5' : 'border-signal-up/20 bg-white'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-graphite uppercase tracking-wider flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-accent" /> Rebooking Risk
              </h2>
              <button
                onClick={() => setShowScheduleFollowUp(true)}
                className="h-8 px-3 rounded-full bg-accent text-white text-xs font-medium hover:bg-accent-hover transition-colors inline-flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" /> Schedule Follow-up
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {/* Churn risk score */}
              <div className="space-y-1.5">
                <p className="text-xs text-graphite/50 uppercase tracking-wide">Churn Risk</p>
                <div className="flex items-end gap-2">
                  <p className={`text-2xl font-bold ${churnRiskColor}`}>{churnRiskScore}</p>
                  <p className="text-xs text-graphite/40 mb-1">/100</p>
                </div>
                <div className="h-1.5 bg-graphite/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${churnRiskBg}`}
                    style={{ width: `${churnRiskScore}%` }}
                  />
                </div>
                <p className={`text-[10px] font-medium ${churnRiskColor}`}>
                  {churnRiskScore <= 33 ? 'Low risk' : churnRiskScore <= 66 ? 'Moderate risk' : 'High risk — act now'}
                </p>
              </div>

              {/* Days since last visit */}
              <div className="space-y-1.5">
                <p className="text-xs text-graphite/50 uppercase tracking-wide">Days Since Last Visit</p>
                <div className="flex items-end gap-2">
                  {daysSinceLastVisit !== null ? (
                    <>
                      <p className={`text-2xl font-bold ${daysSinceLastVisit > 90 ? 'text-signal-down' : daysSinceLastVisit > 45 ? 'text-signal-warn' : 'text-signal-up'}`}>
                        {daysSinceLastVisit}
                      </p>
                      <p className="text-xs text-graphite/40 mb-1">days</p>
                    </>
                  ) : (
                    <p className="text-sm text-graphite/40 mt-1">No visits recorded</p>
                  )}
                </div>
                {daysSinceLastVisit !== null && (
                  <p className="text-[10px] text-graphite/50">
                    {daysSinceLastVisit > 90 ? 'Overdue for rebooking' : daysSinceLastVisit > 45 ? 'Approaching rebooking window' : 'Recently visited'}
                  </p>
                )}
              </div>

              {/* Total visits */}
              <div className="space-y-1.5">
                <p className="text-xs text-graphite/50 uppercase tracking-wide">Total Visits</p>
                <p className="text-2xl font-bold text-graphite">{contact.total_visits}</p>
                <p className="text-[10px] text-graphite/50">Lifetime appointments</p>
              </div>
            </div>
          </div>

          {/* ── CRM-WO-09: Schedule Follow-up Modal ──────────────────── */}
          {showScheduleFollowUp && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-graphite/40 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl border border-accent-soft/30 shadow-xl w-full max-w-md p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-graphite flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-accent" /> Schedule Follow-up
                  </h3>
                  <button onClick={() => setShowScheduleFollowUp(false)} className="w-7 h-7 rounded-full hover:bg-graphite/10 flex items-center justify-center">
                    <X className="w-4 h-4 text-graphite/60" />
                  </button>
                </div>
                {churnRiskScore >= 67 && (
                  <div className="bg-signal-down/10 border border-signal-down/20 rounded-lg p-3 text-xs text-signal-down font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    High churn risk — this contact needs urgent attention.
                  </div>
                )}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-graphite/60 block mb-1">Task Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Rebooking call for Jane Smith"
                      value={followUpTask.title}
                      onChange={e => setFollowUpTask(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full h-9 px-3 rounded-lg border border-accent-soft/30 text-sm text-graphite placeholder:text-graphite/40 focus:outline-none focus:border-accent/40"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-graphite/60 block mb-1">Due Date</label>
                    <input
                      type="date"
                      value={followUpTask.due_date}
                      onChange={e => setFollowUpTask(prev => ({ ...prev, due_date: e.target.value }))}
                      className="w-full h-9 px-3 rounded-lg border border-accent-soft/30 text-sm text-graphite focus:outline-none focus:border-accent/40"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-graphite/60 block mb-1">Notes</label>
                    <textarea
                      placeholder="Add context for this follow-up..."
                      value={followUpTask.notes}
                      onChange={e => setFollowUpTask(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full h-20 px-3 py-2 rounded-lg border border-accent-soft/30 text-sm text-graphite placeholder:text-graphite/40 focus:outline-none focus:border-accent/40 resize-none"
                    />
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setShowScheduleFollowUp(false)}
                    className="flex-1 h-9 rounded-full border border-accent-soft/30 text-sm text-graphite/60 hover:border-accent/30 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleScheduleFollowUp}
                    disabled={scheduleSubmitting || !followUpTask.title.trim()}
                    className="flex-1 h-9 rounded-full bg-accent text-white text-sm font-medium hover:bg-accent-hover disabled:opacity-50 transition-colors"
                  >
                    {scheduleSubmitting ? 'Creating...' : 'Create Task'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── CRM-WO-07: Relevant Market Signals + Link Signal ────── */}
          <div className="bg-white rounded-xl border border-accent/20 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-graphite uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-accent" /> Relevant Market Signals
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setShowLinkSignal(true); setSignalSearch(''); setLinkError(null); setLinkSuccess(null); }}
                  className="h-7 px-3 rounded-full bg-accent/10 text-accent text-[11px] font-medium hover:bg-accent/20 transition-colors inline-flex items-center gap-1.5"
                >
                  <Link2 className="w-3 h-3" /> Link Signal
                </button>
                <Link to="/portal/intelligence" className="text-xs text-accent hover:text-accent-hover font-medium">View All</Link>
              </div>
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

      {/* ── CRM-WO-07: Link Signal Modal ─────────────────────────────────── */}
      {showLinkSignal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-graphite/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-accent-soft/30 shadow-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-graphite flex items-center gap-2">
                <Link2 className="w-4 h-4 text-accent" /> Link Market Signal to Contact
              </h3>
              <button
                onClick={() => { setShowLinkSignal(false); setSignalSearch(''); setLinkError(null); setLinkSuccess(null); setLinkingSignalId(null); }}
                className="w-7 h-7 rounded-full hover:bg-graphite/10 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-graphite/60" />
              </button>
            </div>

            {/* Search input */}
            <div className="relative">
              <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-graphite/40" />
              <input
                type="text"
                placeholder="Search signals by title or category..."
                value={signalSearch}
                onChange={e => setSignalSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-full border border-accent-soft/30 text-sm text-graphite placeholder:text-graphite/40 focus:outline-none focus:border-accent/40 bg-background"
                autoFocus
              />
            </div>

            {/* Success feedback */}
            {linkSuccess && (
              <div className="flex items-center gap-2 bg-signal-up/10 border border-signal-up/20 rounded-lg px-3 py-2 text-sm text-signal-up font-medium">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                Signal linked: {linkSuccess}
              </div>
            )}

            {/* Error feedback */}
            {linkError && (
              <div className="flex items-center gap-2 bg-signal-down/10 border border-signal-down/20 rounded-lg px-3 py-2 text-sm text-signal-down">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {linkError}
              </div>
            )}

            {/* Signal list */}
            <div className="max-h-72 overflow-y-auto space-y-2">
              {filteredSearchSignals.length === 0 ? (
                <p className="text-sm text-graphite/50 py-4 text-center">No signals match your search.</p>
              ) : (
                filteredSearchSignals.map(signal => (
                  <div
                    key={signal.id}
                    className="flex items-start justify-between gap-3 p-3 rounded-lg border border-accent-soft/20 hover:border-accent/20 hover:bg-accent-soft/20 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <TrendingUp className={`w-3 h-3 flex-shrink-0 ${signal.direction === 'up' ? 'text-signal-up' : signal.direction === 'down' ? 'text-signal-down' : 'text-signal-warn'}`} />
                        <span className="text-[10px] text-graphite/40 uppercase">{signal.category ?? 'Market'}</span>
                      </div>
                      <p className="text-sm font-medium text-graphite line-clamp-1">{signal.title}</p>
                      <p className="text-xs text-graphite/50 mt-0.5 line-clamp-1">{signal.description}</p>
                    </div>
                    <button
                      onClick={() => handleLinkSignal(signal)}
                      disabled={!!linkingSignalId || !!linkSuccess}
                      className="h-7 px-3 rounded-full bg-accent text-white text-[11px] font-medium hover:bg-accent-hover disabled:opacity-40 transition-colors flex-shrink-0 inline-flex items-center gap-1"
                    >
                      {linkingSignalId === signal.id ? (
                        <><Clock className="w-3 h-3 animate-spin" /> Linking...</>
                      ) : (
                        <><Link2 className="w-3 h-3" /> Link</>
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>

            <p className="text-xs text-graphite/40 text-center">
              Linking a signal adds it as an interaction in the contact's timeline.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
