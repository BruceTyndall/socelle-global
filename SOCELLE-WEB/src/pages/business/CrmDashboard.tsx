import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Users, Building2, MessageSquare, Calendar, ArrowRight, Phone, Mail, FileText, ClipboardList, CheckSquare, Layers, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import { useOverdueTasks } from '../../lib/useCrmTasks';

// ── CRM Dashboard — V2-HUBS-06 ─────────────────────────────────────────
// Data source: crm_contacts, crm_companies, crm_interactions, appointments, crm_tasks (LIVE)
// Migrated to TanStack Query v5.

interface RecentInteraction {
  id: string;
  type: string;
  subject: string | null;
  occurred_at: string;
  contact_first_name?: string;
  contact_last_name?: string;
}

interface UpcomingAppt {
  id: string;
  client_first_name: string;
  client_last_name: string;
  start_time: string;
  service_name?: string;
}

const INTERACTION_ICONS: Record<string, typeof Phone> = {
  call: Phone,
  email: Mail,
  meeting: Users,
  note: FileText,
};

export default function CrmDashboard() {
  const { profile } = useAuth();
  const businessId = profile?.business_id;
  const { tasks: overdueTasks } = useOverdueTasks(businessId);

  const { data, isLoading: loading } = useQuery({
    queryKey: ['crm_dashboard', businessId],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const todayStart = `${today}T00:00:00`;
      const todayEnd = `${today}T23:59:59`;
      const now = new Date().toISOString();

      const [contactRes, companyRes, interactionsRes, apptRes, recentRes, upcomingRes] = await Promise.all([
        supabase.from('crm_contacts').select('id', { count: 'exact', head: true }).eq('business_id', businessId!),
        supabase.from('crm_companies').select('id', { count: 'exact', head: true }).eq('business_id', businessId!),
        supabase.from('crm_interactions').select('id', { count: 'exact', head: true }).eq('business_id', businessId!).gte('occurred_at', todayStart).lte('occurred_at', todayEnd),
        supabase.from('appointments').select('id', { count: 'exact', head: true }).eq('business_id', businessId!).gte('start_time', now).eq('status', 'scheduled'),
        supabase.from('crm_interactions').select('*, crm_contacts(first_name, last_name)').eq('business_id', businessId!).order('occurred_at', { ascending: false }).limit(8),
        supabase.from('appointments').select('*, booking_services(name)').eq('business_id', businessId!).gte('start_time', now).eq('status', 'scheduled').order('start_time').limit(5),
      ]);

      const mappedInteractions: RecentInteraction[] = (recentRes.data ?? []).map((row: Record<string, unknown>) => {
        const c = row.crm_contacts as { first_name?: string; last_name?: string } | null;
        return {
          id: row.id as string,
          type: row.type as string,
          subject: row.subject as string | null,
          occurred_at: row.occurred_at as string,
          contact_first_name: c?.first_name,
          contact_last_name: c?.last_name,
        };
      });

      const mappedUpcoming: UpcomingAppt[] = (upcomingRes.data ?? []).map((row: Record<string, unknown>) => {
        const svc = row.booking_services as { name?: string } | null;
        return {
          id: row.id as string,
          client_first_name: row.client_first_name as string,
          client_last_name: row.client_last_name as string,
          start_time: row.start_time as string,
          service_name: svc?.name,
        };
      });

      return {
        contactCount: contactRes.count ?? 0,
        companyCount: companyRes.count ?? 0,
        todayInteractions: interactionsRes.count ?? 0,
        upcomingAppointments: apptRes.count ?? 0,
        recentInteractions: mappedInteractions,
        upcoming: mappedUpcoming,
      };
    },
    enabled: !!businessId,
  });

  const stats = data ?? { contactCount: 0, companyCount: 0, todayInteractions: 0, upcomingAppointments: 0, recentInteractions: [], upcoming: [] };
  const isLive = !!data;

  const statCards = [
    { label: 'Contacts', value: stats.contactCount, icon: Users, to: '/portal/crm/contacts', color: 'text-accent' },
    { label: 'Companies', value: stats.companyCount, icon: Building2, to: '/portal/crm/companies', color: 'text-accent' },
    { label: "Today's Interactions", value: stats.todayInteractions, icon: MessageSquare, to: '/portal/crm/contacts', color: 'text-signal-up' },
    { label: 'Upcoming Appointments', value: stats.upcomingAppointments, icon: Calendar, to: '/portal/booking/calendar', color: 'text-signal-warn' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-pro-charcoal">CRM Dashboard</h1>
          <p className="text-sm text-pro-warm-gray mt-1">Manage contacts, companies, and interactions</p>
        </div>
        <div className="flex items-center gap-2">
          {!isLive && !loading && (
            <span className="text-[10px] font-semibold bg-signal-warn/10 text-signal-warn px-2 py-0.5 rounded-full">DEMO</span>
          )}
          <Link to="/portal/crm/contacts/new" className="inline-flex items-center gap-2 h-9 px-4 bg-mn-dark text-white text-sm font-medium rounded-full hover:bg-mn-dark/90 transition-colors">
            <Users className="w-4 h-4" />
            Add Contact
          </Link>
        </div>
      </div>

      {/* Overdue Tasks Alert */}
      {overdueTasks.length > 0 && (
        <Link to="/portal/crm/tasks?filter=overdue" className="block bg-signal-down/5 border border-signal-down/20 rounded-xl px-5 py-4 hover:bg-signal-down/10 transition-colors">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-signal-down flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-pro-charcoal">{overdueTasks.length} overdue task{overdueTasks.length !== 1 ? 's' : ''}</p>
              <p className="text-xs text-pro-warm-gray mt-0.5">Review and update your tasks</p>
            </div>
            <ArrowRight className="w-4 h-4 text-signal-down ml-auto" />
          </div>
        </Link>
      )}

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-xl border border-pro-stone/30 p-5 animate-pulse">
              <div className="h-4 bg-pro-stone/20 rounded w-20 mb-3" />
              <div className="h-8 bg-pro-stone/20 rounded w-16" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map(card => {
            const Icon = card.icon;
            return (
              <Link key={card.label} to={card.to} className="bg-white rounded-xl border border-pro-stone/30 p-5 hover:border-accent/30 transition-colors group">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-pro-warm-gray uppercase tracking-wider">{card.label}</span>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <p className="text-2xl font-semibold text-pro-charcoal">{card.value}</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>View</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Quick Links: Tasks + Segments */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/portal/crm/tasks" className="bg-white rounded-xl border border-pro-stone/30 p-5 hover:border-accent/30 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-pro-charcoal">Tasks</p>
              <p className="text-xs text-pro-warm-gray">Manage follow-ups and reminders</p>
            </div>
            <ArrowRight className="w-4 h-4 text-pro-warm-gray group-hover:text-accent transition-colors" />
          </div>
        </Link>
        <Link to="/portal/crm/segments" className="bg-white rounded-xl border border-pro-stone/30 p-5 hover:border-accent/30 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Layers className="w-5 h-5 text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-pro-charcoal">Segments</p>
              <p className="text-xs text-pro-warm-gray">Group contacts by criteria</p>
            </div>
            <ArrowRight className="w-4 h-4 text-pro-warm-gray group-hover:text-accent transition-colors" />
          </div>
        </Link>
      </div>

      {/* Two-column: Recent Interactions + Upcoming Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Interactions */}
        <div className="bg-white rounded-xl border border-pro-stone/30 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-pro-charcoal uppercase tracking-wider">Recent Interactions</h2>
            <ClipboardList className="w-4 h-4 text-pro-warm-gray" />
          </div>
          {stats.recentInteractions.length === 0 ? (
            <p className="text-sm text-pro-warm-gray py-4">No interactions yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recentInteractions.map(ix => {
                const Icon = INTERACTION_ICONS[ix.type] ?? FileText;
                return (
                  <div key={ix.id} className="flex items-start gap-3 py-2 border-b border-pro-stone/10 last:border-0">
                    <div className="mt-0.5 w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-3.5 h-3.5 text-accent" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-pro-charcoal truncate">
                        {ix.subject || ix.type}
                      </p>
                      <p className="text-xs text-pro-warm-gray">
                        {ix.contact_first_name} {ix.contact_last_name} &middot; {new Date(ix.occurred_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white rounded-xl border border-pro-stone/30 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-pro-charcoal uppercase tracking-wider">Upcoming Appointments</h2>
            <Calendar className="w-4 h-4 text-pro-warm-gray" />
          </div>
          {stats.upcoming.length === 0 ? (
            <p className="text-sm text-pro-warm-gray py-4">No upcoming appointments</p>
          ) : (
            <div className="space-y-3">
              {stats.upcoming.map(appt => (
                <Link key={appt.id} to={`/portal/booking/appointments/${appt.id}`} className="flex items-center gap-3 py-2 border-b border-pro-stone/10 last:border-0 hover:bg-pro-ivory/50 -mx-2 px-2 rounded-lg transition-colors">
                  <div className="w-7 h-7 rounded-full bg-signal-warn/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-3.5 h-3.5 text-signal-warn" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-pro-charcoal">
                      {appt.client_first_name} {appt.client_last_name}
                    </p>
                    <p className="text-xs text-pro-warm-gray">
                      {appt.service_name ?? 'Service'} &middot; {new Date(appt.start_time).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-pro-warm-gray flex-shrink-0" />
                </Link>
              ))}
            </div>
          )}
          <Link to="/portal/booking/calendar" className="inline-flex items-center gap-1 text-xs font-medium text-accent mt-3 hover:text-accent-hover transition-colors">
            View Calendar <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
